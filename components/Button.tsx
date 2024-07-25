import { JSX } from "preact/jsx-runtime";

interface Props extends JSX.HTMLAttributes<HTMLButtonElement> {
}

export function Button(props: Props) {
    const { class: classString, children, ...other } = props;
    return (
        <button
            class={`bg-blue-500 hover:bg-blue-700 text-white font-bold ${
                classString && /p-|py-|px-/.test(classString as string)
                    ? ""
                    : "py-2 px-4"
            } rounded focus:outline-none focus:shadow-outline ${classString}`}
            {...other}
        >
            {children}
        </button>
    );
}
