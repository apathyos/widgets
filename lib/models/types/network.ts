export enum NMSettingsConnectionBusMethod {
    ClearSecrets = 'ClearSecrets',
}

export const NMSettingsConnectionBusMethodSignature = {
    [NMSettingsConnectionBusMethod.ClearSecrets]: '',
} as const;

type NMSettingsConnectionMethodSignature = typeof NMSettingsConnectionBusMethodSignature;

export type NMSettingsConnectionSignatureByMethod = {
    [NMSettingsConnectionBusMethod.ClearSecrets]: NMSettingsConnectionMethodSignature[NMSettingsConnectionBusMethod.ClearSecrets];
};
