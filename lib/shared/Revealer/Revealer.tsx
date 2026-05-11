import { IRevealerBase, RevealerBase } from '../base/RevealerBase';

export interface IRevealer extends IRevealerBase {}

export function Revealer(props: IRevealer) {
    return <RevealerBase {...props} />;
}
