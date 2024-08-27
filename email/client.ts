import nodemailer from "nodemailer";
import { load } from "$std/dotenv/mod.ts";

const env = await load();

interface Email {
  emailAddress: string;
  subject: string;
  html: string;
  text: string;
}

export async function prepareEmail(
  emailAddress: string,
  template: "verify-email" | "reset-password",
  options: Record<string, string>,
): Promise<Email> {
  const [html, text] = await Promise.all([
    createEmailContent(`./email/templates/${template}.html`, options),
    createEmailContent(`./email/templates/${template}.txt`, options),
  ]);

  const subject = (html.match(/<title>(.*?)<\/title>/) as RegExpMatchArray)[1];

  return {
    emailAddress,
    subject,
    html,
    text,
  };
}

async function createEmailContent(
  templateFile: string,
  variables: Record<string, string>,
) {
  const template = await Deno.readTextFile(
    templateFile,
  );

  let result = template;

  for (const key in variables) {
    const regex = new RegExp(`{{${key}}}`, "g");
    result = result.replace(regex, variables[key]);
  }

  const unusedVariable = result.match(/\{\{.*\}\}/g);

  if (unusedVariable) {
    throw new Error(
      `Unaccounted for variable(s) ${unusedVariable.join(",")}`,
    );
  }

  return result;
}

async function sendEmail({ emailAddress, subject, html, text }: Email) {
  if (env.EMAILER_STATUS === "on") {
    try {
      const transporter = nodemailer.createTransport({
        host: env.SMTP_SERVER_HOST,
        port: parseInt(env.SMTP_PORT),
        secure: false,
        auth: {
          user: env.SMTP_USERNAME,
          pass: env.SMTP_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: env.SMTP_EMAIL_ADDRESS,
        to: emailAddress,
        subject,
        text,
        html,
      });
    } catch (err) {
      console.error(`Could not send email ${emailAddress}`);
      console.error(err);
    }
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
