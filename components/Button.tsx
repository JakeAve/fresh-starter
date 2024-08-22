import { JSX } from "preact/jsx-runtime";

type ButtonOrLink =
  & JSX.HTMLAttributes<HTMLButtonElement>
  & JSX.HTMLAttributes<HTMLLinkElement>;

interface Props extends ButtonOrLink {
}

export function Button(props: Props) {
  const { class: classString, children, ...other } = props;

  const isLink = !!props.href;

  const hasPaddingUpdates = classString &&
    /p-|py-|px-/.test(classString as string);
  const hasColorUpdates = classString &&
    /bg-.*?-\d+\b/.test(classString as string);

  const baseClasses =
    "font-bold rounded focus:outline-none focus:shadow-outline";
  const colorClasses = hasColorUpdates
    ? ""
    : "bg-blue-500 hover:bg-blue-700 text-white";
  const paddingClasses = hasPaddingUpdates ? "" : "py-2 px-4";

  return isLink
    ? (
      // @ts-ignore some problems with the intersection
      <a
        class={`${baseClasses} ${colorClasses} ${paddingClasses} ${classString}`}
        {...other}
      >
        {children}
      </a>
    )
    : (
      <button
        class={`${baseClasses} ${colorClasses} ${paddingClasses} ${classString}`}
        {...other}
      >
        {children}
      </button>
    );
}
