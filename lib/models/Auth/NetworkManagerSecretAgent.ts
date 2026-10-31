import { NM_SECRET_AGENT_XML } from '@/config/dbus/auth';
import {
    NM_AGENT_IDENTIFIER,
    NM_AGENT_INTERFACE,
    NM_AGENT_MANAGER_INTERFACE,
    NM_AGENT_MANAGER_PATH,
    NM_AGENT_PATH,
    NM_BUS_NAME
} from '@/constants/auth';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import NM from 'gi://NM';
import { Bus } from '../base/Bus';
import { NMSecretAgentBusMethod, NMSecretAgentBusMethodSignature, NMSecretAgentSignatureByMethod } from '@/types/auth';
import { getDebugLog, getErrorLog, getWarningLog } from '@/utils/log';
import { NM_AGENT_PREFIX } from '@/constants/log';
import { DBusMethod } from '@/types/bus';
import { AuthError } from '@/errors';
import { SignalRegistry } from '@/registry/SignalRegistry';
import { NMAgentCommand, NMAgentPendingRequest, NMSecretAgentCommand, NMSecretAgentSignal } from '../types/auth';
import { AuthAgent } from '../base/AuthAgent';
import { getConnectionSsidFromVariant } from '@/utils/system';
import { Delay, Dispose, Reject, Resolve } from '@/types/common';
import { noop } from '@/utils/misc';
import AstalNetwork from 'gi://AstalNetwork?version=0.1';
import { NetworkRemoteConnectionSecuritySettingsName } from '@/types/system';
import { NetworkSettingsConnection } from '../Network/NetworkSettingsConnection';
import { timeout } from 'ags/time';

const logWarning = getWarningLog({ prefix: NM_AGENT_PREFIX });
const logError = getErrorLog({ prefix: NM_AGENT_PREFIX });
const logDebug = getDebugLog({ prefix: NM_AGENT_PREFIX });

Gio._promisify(Gio.DBusConnection.prototype, 'call', 'call_finish');

export class NetworkManagerSecretAgent extends AuthAgent {
    private readonly bus: Bus<NMSecretAgentSignatureByMethod>;
    private readonly nmSettingsConnection: NetworkSettingsConnection;
    private readonly signalRegistry: SignalRegistry<NMAgentCommand>;

    private registrationId = 0;
    private readonly pending = new Map<string, NMAgentPendingRequest>();
    private readonly disposables: { global: Dispose[]; byRequest: Record<string, Dispose[]> } = { global: [], byRequest: {} };

    private isDevicesEnabled: boolean = false;

    constructor(protected NetworkService: AstalNetwork.Network) {
        super();

        this.bus = new Bus(Gio.DBus.system, NM_BUS_NAME, NM_AGENT_MANAGER_PATH, NM_AGENT_MANAGER_INTERFACE);
        this.nmSettingsConnection = new NetworkSettingsConnection();
        this.signalRegistry = new SignalRegistry();
    }

    async register() {
        const connectionName = this.bus.connection.get_unique_name();

        logDebug(`Start secret agent registration: ${connectionName}`);

        if (this.registrationId !== 0) {
            logDebug('Couldn\'t register secret agent. Agent is already registered');
            return;
        }

        const nodeInfo = Gio.DBusNodeInfo.new_for_xml(NM_SECRET_AGENT_XML);
        const interfaceInfo = nodeInfo.interfaces.find((iface) => iface.name === NM_AGENT_INTERFACE);

        if (!interfaceInfo) {
            return this.throwError('SecretAgent interface not found');
        }

        this.registrationId = this.bus.connection.register_object_with_closures2(
            NM_AGENT_PATH,
            interfaceInfo,
            this.handleMethodCall.bind(this),
            null,
            null,
        );

        try {
            logDebug('Register secret agent with capabilities');

            await this.bus.call({
                method: NMSecretAgentBusMethod.RegisterWithCapabilities,
                parameters: new GLib.Variant(NMSecretAgentBusMethodSignature.RegisterWithCapabilities, [NM_AGENT_IDENTIFIER, 0])
            });

            logDebug(`Agent has been registered: ${connectionName}`);
            this.listenForStateChanges();
        } catch (error) {
            return this.throwError(`Couldn't register agent: ${connectionName}`);
        }
    }

    async unregister() {
        const connectionName = this.bus.connection.get_unique_name();

        logDebug(`Unregister secret agent: ${connectionName}`);

        if (this.registrationId === 0) {
            return logDebug(`Couldn't unregister agent: ${connectionName}. Requested agent is not registered`);
        }

        this.stop();
        this.disposables.global.forEach(cb => cb());

        try {
            await this.bus.call({ method: NMSecretAgentBusMethod.Unregister });
        } finally {
            this.resetAgent();
        }
    }

    stop(args?: { id?: string; method?: NMSecretAgentBusMethod; reason?: string; }) {
        const { id, method = NMSecretAgentBusMethod.UserCanceled, reason = 'Authentication has been canceled' } = args ?? {};

        let requests: NMAgentPendingRequest[] = [];;

        if (id) {
            const request = this.pending.get(id);
            request && (requests = [request]);
        }

        if (!requests.length) {
            this.pending.values().forEach(request => requests.push(request));
        }

        requests.forEach((request) => {
            const { id, invocation, connectionPath, resolve } = request;

            logDebug(`(${connectionPath}) stop connection request: ${id}`);

            this.sendInvocationError(invocation, method, reason);
            resolve();
            this.pending.delete(id);

            this.resetConnectionAttempt({ request });
            this.disposables.byRequest[id].forEach(cb => cb());
            this.emitCommand({ type: NMSecretAgentCommand.CLOSE, requestId: id });
        });
    }

    signal(cb: NMSecretAgentSignal): Dispose {
        return this.signalRegistry.register(cb);
    }

    private emitCommand(command: NMAgentCommand) {
        this.signalRegistry.emit(command);
    }

    private handleMethodCall<M extends NMSecretAgentBusMethod>(
        _connection: Gio.DBusConnection,
        _sender: string,
        _objectPath: string,
        _interfaceName: string,
        methodName: M,
        parameters: GLib.Variant,
        invocation: Gio.DBusMethodInvocation,
    ) {
        logDebug(`Received ${methodName} method call`);

        try {
            switch (methodName) {
                case NMSecretAgentBusMethod.GetSecrets:
                    this.handleGetSecrets(parameters, invocation);
                    break;

                case NMSecretAgentBusMethod.CancelGetSecrets:
                    this.handleCancelGetSecrets(parameters, invocation);
                    break;

                case NMSecretAgentBusMethod.SaveSecrets:
                case NMSecretAgentBusMethod.DeleteSecrets:
                    invocation.return_value(GLib.Variant.new_tuple([]));
                    break;

                default:
                    this.sendInvocationError(invocation, DBusMethod.ErrorUnknownMethod, `Unknown method: ${methodName}`);
            }
        } catch (error) {
            this.sendInvocationError(invocation, NMSecretAgentBusMethod.InternalError, String(error));
        }
    }

    private handleGetSecrets(
        parameters: GLib.Variant<NMSecretAgentSignatureByMethod[NMSecretAgentBusMethod.GetSecrets]>,
        invocation: Gio.DBusMethodInvocation,
    ) {
        const connectionVariant = parameters.get_child_value(0);
        const connectionPath = parameters.get_child_value(1).get_string()[0];
        const settingName = parameters.get_child_value(2).get_string()[0];
        const flags = parameters.get_child_value(4).get_uint32();

        if (settingName !== NetworkRemoteConnectionSecuritySettingsName.WIRELESS_SECURITY_802_11) {
            this.sendInvocationError(invocation, NMSecretAgentBusMethod.NoSecrets, `Unsupported secret setting: ${settingName}`);
            return;
        }

        const requestNew = Boolean(flags & NM.SecretAgentGetSecretsFlags.REQUEST_NEW);
        const allowInteraction = Boolean(flags & NM.SecretAgentGetSecretsFlags.ALLOW_INTERACTION);

        let ssid: string | null = null;

        try {
            logDebug(`(${connectionPath}) Trying extract SSID for ${settingName}`);
            ssid = getConnectionSsidFromVariant(connectionVariant);
        } catch (error) {
            logWarning('Failed to extract SSID:', error);
        }

        if (!allowInteraction && !requestNew) {
            this.sendInvocationError(invocation, NMSecretAgentBusMethod.NoSecrets, 'No stored secrets');
            return;
        }

        const connection = this.getClient().get_connection_by_path(connectionPath);
        const connectionUUID = connection.get_uuid();
        const key = this.getPendingRequestKey({ path: connectionPath, setting: settingName });

        const previous = this.pending.get(key);
        const request: NMAgentPendingRequest = this.makeRequest({
            id: key,
            invocation,
            connectionPath,
            connectionUUID,
            isAwaitingSecret: true,
            secretsWereProvided: previous?.secretsWereProvided
        });

        this.pending.set(key, request);
        logDebug(`(${connectionPath}) handling request: ${request.id}. Previous was: ${previous?.id ?? null}`);

        if (previous) {
            logDebug(`(${connectionPath}) found previous request for this session (${previous.id}). It will be used instead`);
            previous.connectionTimer?.cancel();
            return;
        }

        this.listenForConnectionRequestStateChanges({ id: request.id });

        this.emitCommand({
            type: NMSecretAgentCommand.START_SESSION,
            request: {
                id: key,
                ssid,
                connectionPath,
                submit: async (value) => {
                    const request = this.pending.get(key);

                    if (!request) {
                        logWarning('There is no request to submit. Probably it has already been processed');
                        return;
                    }

                    const { invocation, connectionPath } = request;

                    logDebug(`(${connectionPath}) send connection with security settings applied`);
                    invocation.return_value(GLib.Variant.new_tuple([this.getConnectionWithPskAddedDBusVariant({ psk: value })]));

                    this.pending.set(request.id, { ...request, secretsWereProvided: true });
                    await request.handle;
                }
            }
        });
    }

    private handleCancelGetSecrets(
        parameters: GLib.Variant<NMSecretAgentSignatureByMethod[NMSecretAgentBusMethod.CancelGetSecrets]>,
        invocation: Gio.DBusMethodInvocation,
    ) {
        const connectionPath = parameters.get_child_value(0).get_string()[0];
        const settingName = parameters.get_child_value(1).get_string()[0];

        const key = this.getPendingRequestKey({ path: connectionPath, setting: settingName });
        const request = this.pending.get(key);

        if (request) {
            this.stop({
                id: request.id,
                method: NMSecretAgentBusMethod.AgentCanceled,
                reason: 'Authentication request canceled'
            });
        }

        invocation.return_value(GLib.Variant.new_tuple([]));
    }

    private listenForStateChanges() {
        logDebug('Start listening for device state changes');

        const device = this.getDevice();

        const deviceStateChangedSub = device?.connect('state-changed', (_, newState) => {
            switch (newState) {
                case NM.DeviceState.UNAVAILABLE:
                case NM.DeviceState.UNMANAGED:
                    logDebug('Device is unavailable. Stopping active connections attempts');
                    this.stop();
            }
        });

        const wifiNotifySub = this.NetworkService.wifi?.connect('notify', (wifi) => {
            if (!wifi.enabled && this.isDevicesEnabled) {
                logDebug('Wifi is unavailable. Stopping active connections attempts');
                this.stop();
            }

            this.isDevicesEnabled = wifi.enabled;
        });

        this.disposables.global.push(
            () => typeof deviceStateChangedSub === 'number' && this.getWifi()?.disconnect(deviceStateChangedSub),
            () => typeof wifiNotifySub === 'number' && this.getWifi()?.disconnect(wifiNotifySub)
        );
    }

    private listenForConnectionRequestStateChanges(args: { id: string }) {
        const { id } = args;

        const request = this.pending.get(id);
        const device = this.getDevice();

        if (!request?.isAwaitingSecret || !device) {
            return;
        }

        const deviceStateChangedSub = device.connect('state-changed', async (device, newState, _oldState, reason) => {
            const request = this.pending.get(id);

            if (!request?.isAwaitingSecret) {
                return;
            }

            const currentConnection = device.get_active_connection();

            if (!currentConnection || currentConnection.connection.get_uuid() !== request.connectionUUID) {
                return;
            }

            switch (newState) {
                case NM.DeviceState.DEACTIVATING:
                case NM.DeviceState.DISCONNECTED:
                case NM.DeviceState.NEED_AUTH:
                case NM.DeviceState.FAILED:
                    this.resetConnectionAttempt({ request });
                    break;
            }

            switch (newState) {
                case NM.DeviceState.ACTIVATED:
                    logDebug(`(${request.connectionPath}) connection is activated`);

                    request.resolve();
                    this.pending.delete(request.id);
                    this.emitCommand({ type: NMSecretAgentCommand.CLOSE, requestId: request.id });
                    break;

                case NM.DeviceState.FAILED:
                    if (reason === NM.DeviceStateReason.NO_SECRETS) {
                        logDebug(`(${request.connectionPath}) connection activation failed: no secrets`);

                        const connectionTimer = timeout(Delay.S, () => {
                            const device = this.getDevice();
                            const client = this.getClient();
                            const connection = client.get_connection_by_uuid(request.connectionUUID);

                            logDebug(`(${request.connectionPath}) connection activation attempt`);
                            client.activate_connection_async(
                                connection,
                                device,
                                currentConnection?.get_specific_object_path() ?? connection.get_path(),
                                null,
                                (_, res) => {
                                    try {
                                        client.activate_connection_finish(res);
                                        request.reject('Password is not accepted');
                                    } catch { }
                                }
                            );
                        });

                        this.pending.set(request.id, { ...request, isAwaitingSecret: false, connectionTimer });
                    }
                    break;
                case NM.DeviceState.UNAVAILABLE:
                case NM.DeviceState.UNMANAGED:
                case NM.DeviceState.DEACTIVATING:
                case NM.DeviceState.DISCONNECTED:
                    logDebug(`(${request.connectionPath}) connection activation failed: device is in unmanagable state`);
                    this.stop({ id, method: NMSecretAgentBusMethod.AgentCanceled });
            }
        });

        this.disposables.byRequest[request.id] ??= [];
        this.disposables.byRequest[request.id].push(() => this.getWifi()?.disconnect(deviceStateChangedSub));
    }

    private makeRequest(args: Omit<NMAgentPendingRequest, 'handle' | 'resolve' | 'reject'>): NMAgentPendingRequest {
        const { ...from } = args;

        let resolve: Resolve = noop;
        let reject: Reject = noop;
        const handle = new Promise<void>((res, rej) => { resolve = res; reject = rej; });

        const request: NMAgentPendingRequest = {
            handle,
            resolve,
            reject,
            ...from,
        };

        return request;
    }

    private resetConnectionAttempt(args: { request: NMAgentPendingRequest }) {
        const { request } = args;
        const { secretsWereProvided, connectionPath, connectionTimer } = request;

        logDebug(`(${connectionPath}) reset connection attempt`);

        logDebug(`(${connectionPath}) cancel active connection attempt`);
        connectionTimer?.cancel();

        if (secretsWereProvided) {
            logDebug(`(${connectionPath}) clear connection secrets`);
            this.nmSettingsConnection.clearConnectionSecrets({ path: connectionPath });
        }
    }

    private resetAgent() {
        this.bus.connection.unregister_object(this.registrationId);
        this.registrationId = 0;
    }

    private throwError(message: string) {
        logError(message);
        this.resetAgent();
        throw new AuthError(message);
    }

    private sendInvocationError(
        invocation: Gio.DBusMethodInvocation,
        method: string,
        message: string
    ) {
        const msg = `${NM_AGENT_INTERFACE}.${method}: ${message}`;

        logError(msg);
        invocation.return_dbus_error(`${NM_AGENT_INTERFACE}.${method}`, message);
    }

    private getPendingRequestKey(args: { path: string; setting: string }) {
        const { path, setting } = args;

        return `${path}:${setting}`;
    }

    private getWifi() {
        return this.NetworkService.wifi;
    }

    private getDevice() {
        return this.NetworkService.wifi?.device ?? null;
    }

    protected getClient() {
        return this.NetworkService.get_client();
    }

    private getConnectionWithPskAddedDBusVariant(args: {
        psk: string;
    }) {
        const { psk } = args;

        const secretConnection = new NM.SimpleConnection();
        const security = secretConnection.get_setting_wireless_security();

        secretConnection.add_setting(new NM.SettingWirelessSecurity({ psk }));
        security?.set_secret_flags('psk', NM.SettingSecretFlags.NOT_SAVED);

        return secretConnection.to_dbus(NM.ConnectionSerializationFlags.ALL);
    }
}
