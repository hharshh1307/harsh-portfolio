import "server-only";

/** Minimal Telegram Bot API client — only what the content bot needs. */

const token = () => {
  const t = process.env.TELEGRAM_BOT_TOKEN;
  if (!t) throw new Error("TELEGRAM_BOT_TOKEN is not set");
  return t;
};

async function call<T = unknown>(method: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`https://api.telegram.org/bot${token()}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as { ok: boolean; result: T; description?: string };
  if (!data.ok) throw new Error(`Telegram ${method} failed: ${data.description}`);
  return data.result;
}

export type InlineButton = { text: string; callback_data?: string; url?: string };

const MAX_LEN = 4000;

export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function sendMessage(
  chatId: number,
  html: string,
  buttons?: InlineButton[][],
): Promise<{ message_id: number }> {
  const text = html.length > MAX_LEN ? `${html.slice(0, MAX_LEN)}\n…` : html;
  return call("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    link_preview_options: { is_disabled: true },
    ...(buttons ? { reply_markup: { inline_keyboard: buttons } } : {}),
  });
}

export async function editMessage(chatId: number, messageId: number, html: string) {
  try {
    await call("editMessageText", {
      chat_id: chatId,
      message_id: messageId,
      text: html.slice(0, MAX_LEN),
      parse_mode: "HTML",
      link_preview_options: { is_disabled: true },
    });
  } catch {
    // Editing can fail if the text is unchanged or the message is too old; not worth surfacing.
  }
}

export async function answerCallback(id: string, text?: string) {
  await call("answerCallbackQuery", { callback_query_id: id, ...(text ? { text } : {}) });
}

export async function sendTyping(chatId: number) {
  await call("sendChatAction", { chat_id: chatId, action: "typing" }).catch(() => undefined);
}

export async function downloadFile(fileId: string): Promise<{ bytes: Uint8Array; path: string }> {
  const file = await call<{ file_path: string; file_size?: number }>("getFile", { file_id: fileId });
  const res = await fetch(`https://api.telegram.org/file/bot${token()}/${file.file_path}`);
  if (!res.ok) throw new Error(`Download failed (${res.status})`);
  return { bytes: new Uint8Array(await res.arrayBuffer()), path: file.file_path };
}

// --- Update types (only the fields we use) ---

export type TgUser = { id: number; first_name?: string; username?: string };
export type TgPhotoSize = { file_id: string; width: number; height: number; file_size?: number };
export type TgMessage = {
  message_id: number;
  from?: TgUser;
  chat: { id: number; type: string };
  text?: string;
  caption?: string;
  photo?: TgPhotoSize[];
  document?: { file_id: string; mime_type?: string; file_name?: string; file_size?: number };
  media_group_id?: string;
};
export type TgUpdate = {
  update_id: number;
  message?: TgMessage;
  callback_query?: { id: string; from: TgUser; message?: TgMessage; data?: string };
};
