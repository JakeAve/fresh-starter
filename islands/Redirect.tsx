import { IS_BROWSER } from "$fresh/runtime.ts";

interface Props {
    timeout?: number;
    to: string;
}

export default function (props: Props) {
    if (!IS_BROWSER) return <></>;

    const { timeout = 0, to } = props;

    setTimeout(() => {
        location.replace(to);
    }, timeout);

    return <></>;
}
