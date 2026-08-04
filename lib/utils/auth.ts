import Polkit from 'gi://Polkit';
import GLib from 'gi://GLib';
import { PolkitIdentity, PolkitIdentityDetailsEntry, PolkitIdentityKind } from '@/types/auth';
import { getUnpackedNumber } from './misc';

export const createPolkitIdentity = ([kind, details]: PolkitIdentity) => {
    if (kind !== PolkitIdentityKind.UNIX_USER) {
        throw new Error(`Unsupported Polkit identity: ${kind}`);
    }

    const uid = getUnpackedNumber(details[PolkitIdentityDetailsEntry.UID]);

    if (!Number.isInteger(uid) || uid < 0) {
        throw new Error(`Invalid Polkit uid: ${uid}`);
    }

    return Polkit.UnixUser.new(uid);
};

export const choosePolkitIdentity = (identities: PolkitIdentity[]): Polkit.Identity => {
    if (identities.length === 0) {
        throw new Error('Polkit did not provide authentication identities');
    }

    const currentUser = Polkit.UnixUser.new_for_name(GLib.get_user_name());

    if (!currentUser || !(currentUser instanceof Polkit.UnixUser)) {
        return createPolkitIdentity(identities[0]);
    }

    const uid = currentUser.get_uid();
    const selected = identities.find(([, details]) => getUnpackedNumber(details[PolkitIdentityDetailsEntry.UID]) === uid);

    return createPolkitIdentity(selected ?? identities[0]);
};
