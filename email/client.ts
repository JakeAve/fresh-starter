import { SMTPClient } from "deno-mailer";
// import { MailSlurp } from "mailslurp";
import { load } from "$std/dotenv/mod.ts";

const env = await load();

interface Email {
  emailAddress: string;
  subject: string;
  html: string;
}

export async function prepareEmail(
  emailAddress: string,
  template: "verify-email" | "reset-password",
  options?: Record<string, string>,
): Promise<Email> {
  const templateHTML = await Deno.readTextFile(
    `./email/templates/${template}.html`,
  );

  const subject =
    (templateHTML.match(/<title>(.*?)<\/title>/) as RegExpMatchArray)[1];

  let html = templateHTML;

  for (const key in options) {
    const regex = new RegExp(`{{${key}}}`, "g");
    html = html.replace(regex, options[key]);
  }

  const unusedVariable = html.match(/\{\{.*\}\}/g);

  if (unusedVariable) {
    throw new Error(
      `Unaccounted for variable(s) ${unusedVariable.join(",")}`,
    );
  }

  return {
    emailAddress,
    subject,
    html,
  };
}

async function sendEmail({ emailAddress, subject, html }: Email) {
  if (env.EMAILER_STATUS === "on") {
    const client = new SMTPClient({
      connection: {
        hostname: env.SMTP_SERVER_HOST,
        port: parseInt(env.SMTP_PORT),
        tls: true,
        auth: {
          username: env.SMTP_USERNAME,
          password: env.SMTP_PASSWORD,
        },
      },
    });
    await client.send({
      from: env.SMTP_EMAIL_ADDRESS,
      to: emailAddress,
      subject,
      html,
    });
    await client.close();
  } else {
    Deno.writeTextFileSync(
      `./emails/${
        new Date().toISOString().replace(/\:|\./g, "-")
      }-${subject}.html`,
      html,
    );
  }
}

export async function sendVerifyEmail(
  emailAddress: string,
  variables: { USER: string; YEAR: string; COMPANY: string; LINK: string },
) {
  const email = await prepareEmail(emailAddress, "verify-email", variables);
  await sendEmail(email);
}

export async function sendResetPassword(
  emailAddress: string,
  variables: {
    USER: string;
    YEAR: string;
    CODE: string;
    LINK: string;
    COMPANY: string;
  },
) {
  const email = await prepareEmail(emailAddress, "reset-password", variables);
  await sendEmail(email);
}
