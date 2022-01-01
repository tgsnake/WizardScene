// Tgsnake - Telegram MTProto framework developed based on gram.js.
// Copyright (C) 2021 Butthx <https://github.com/butthx>
//
// This file is part of Tgsnake
//
// Tgsnake is a free software : you can redistribute it and/or modify
//  it under the terms of the MIT License as published.
import { Updates, Composer } from 'tgsnake';
import { ResultGetEntity } from 'tgsnake/lib/Telegram/Users/GetEntity';
import { MessageContext } from 'tgsnake/lib/Context/MessageContext';
type MiddlewareFn<C> = (ctx: C, next: NextFn) => MaybePromise<any>;
type NextFn = () => MaybePromise<void>;
const leaf = () => Promise.resolve();
async function run<C>(middleware: MiddlewareFn<C>, ctx: C) {
  await middleware(ctx, leaf);
}
export type MaybePromise<T> = T | Promise<T>;
export type hSceneFn = (ctx: Updates.TypeUpdate, data: any) => MaybePromise<any>;
export interface dataScene {
  isRunning: boolean;
  data: any;
  index: number;
}
export interface userObject {
  userId: bigint;
  chatId: bigint;
  senderChatId?: bigint;
}
export type FilterFn = (ctx: Updates.TypeUpdate, data: any) => MaybePromise<number>;
export class WizardError extends Error {
  code!: number;
  description?: string;
  message!: string;
  constructor(code: number, message: string, description?: string) {
    super();
    this.code = code;
    this.message = message;
    this.description = description;
    return this;
  }
}
export class Scene extends Composer {
  id!: string;
  private handlers: Map<number, hSceneFn> = new Map();
  users: Map<string, dataScene> = new Map();
  ignoreSenderChat: boolean = false;
  constructor(id: string, ...handler: Array<hSceneFn>) {
    super();
    this.id = id;
    for (let i in handler) {
      this.handlers.set(Number(i), handler[i]);
    }
  }
  private _getId(ctx: Updates.TypeUpdate) {
    if (ctx instanceof ResultGetEntity) {
      ctx as ResultGetEntity;
      return {
        userId: ctx.id,
        chatId: ctx.id,
      } as userObject;
    }
    if (ctx instanceof MessageContext) {
      ctx as MessageContext;
      return {
        userId: ctx.from.id,
        senderChatId: ctx.senderChat && !ctx.isAutomaticForward ? ctx.senderChat?.id : undefined,
        chatId: ctx.chat.id,
      } as userObject;
    }
    if (ctx instanceof Updates.UpdateNewMessage) {
      ctx as Updates.UpdateNewMessage;
      let message = ctx.message as MessageContext;
      return {
        userId: message.from.id,
        chatId: message.chat.id,
        senderChatId:
          message.senderChat && !message.isAutomaticForward ? message.senderChat?.id : undefined,
      } as userObject;
    }
    if (ctx instanceof Updates.UpdateShortMessage) {
      ctx as Updates.UpdateShortMessage;
      let message = ctx.message as MessageContext;
      return {
        userId: message.from.id,
        chatId: message.chat.id,
        senderChatId:
          message.senderChat && !message.isAutomaticForward ? message.senderChat?.id : undefined,
      } as userObject;
    }
    if (ctx instanceof Updates.UpdateShortChatMessage) {
      ctx as Updates.UpdateShortChatMessage;
      let message = ctx.message as MessageContext;
      return {
        userId: message.from.id,
        chatId: message.chat.id,
        senderChatId:
          message.senderChat && !message.isAutomaticForward ? message.senderChat?.id : undefined,
      } as userObject;
    }
    if (ctx instanceof Updates.UpdateNewChannelMessage) {
      ctx as Updates.UpdateNewChannelMessage;
      let message = ctx.message as MessageContext;
      return {
        userId: message.from.id,
        chatId: message.chat.id,
        senderChatId:
          message.senderChat && !message.isAutomaticForward ? message.senderChat?.id : undefined,
      } as userObject;
    }
    if (ctx instanceof Updates.UpdateBotCallbackQuery) {
      ctx as Updates.UpdateBotCallbackQuery;
      let chatId = ctx.message ? ctx.message.chat.id : ctx.from.id;
      return {
        userId: ctx.from.id,
        chatId: chatId,
        senderChatId:
          ctx.message &&
          ctx.message.replyToMessage &&
          ctx.message.replyToMessage.senderChat &&
          !ctx.message.replyToMessage.isAutomaticForward
            ? ctx.message.replyToMessage.senderChat.id
            : undefined,
      } as userObject;
    }
    if (ctx instanceof Updates.UpdateBotInlineQuery) {
      ctx as Updates.UpdateBotInlineQuery;
      return {
        userId: ctx.from.id,
        chatId: ctx.from.id,
      } as userObject;
    }
  }
  private _cursor(filter: FilterFn, data?: any) {
    return async (ctx) => {
      let info = await this._getId(ctx);
      if (info) {
        if (info.senderChatId && !this.ignoreSenderChat) {
          let user = await this.users.get(`${info.chatId}_${info.senderChatId}`);
          if (user) {
            let index = await filter(ctx, user.data);
            let fn = this.handlers.get(index as number);
            if (fn) {
              user.isRunning = true;
              user.index = index;
              if (data) user.data = data;
              this.users.set(`${info.chatId}_${info.userId}`, user);
            } else {
              user.isRunning = false;
              user.index = 0;
              if (data) user.data = data;
              this.users.set(`${info.chatId}_${info.userId}`, user);
            }
          }
        } else {
          let user = await this.users.get(`${info.chatId}_${info.userId}`);
          if (user) {
            let index = await filter(ctx, user.data);
            let fn = this.handlers.get(index as number);
            if (fn) {
              user.isRunning = true;
              user.index = index;
              if (data) user.data = data;
              this.users.set(`${info.chatId}_${info.userId}`, user);
            } else {
              user.isRunning = false;
              user.index = 0;
              if (data) user.data = data;
              this.users.set(`${info.chatId}_${info.userId}`, user);
            }
          }
        }
      }
      return true;
    };
  }
  cursor(ctx: Updates.TypeUpdate, filter: FilterFn, data?: any) {
    return this._cursor(filter)(ctx);
  }
  next(ctx, data?: any) {
    this._cursor(async (ctx) => {
      let info = await this._getId(ctx);
      if (info) {
        if (info.senderChatId && !this.ignoreSenderChat) {
          let user = this.users.get(`${info.chatId}_${info.senderChatId}`);
          if (user) {
            return Number(user.index + 1);
          }
        } else {
          let user = this.users.get(`${info.chatId}_${info.userId}`);
          if (user) {
            return Number(user.index + 1);
          }
        }
      }
      return 0;
    }, data)(ctx);
  }
  prev(ctx, data?: any) {
    this._cursor(async (ctx) => {
      let info = await this._getId(ctx);
      if (info) {
        if (info.senderChatId && !this.ignoreSenderChat) {
          let user = this.users.get(`${info.chatId}_${info.senderChatId}`);
          if (user) {
            return Number(user.index - 1);
          }
        } else {
          let user = this.users.get(`${info.chatId}_${info.userId}`);
          if (user) {
            return Number(user.index - 1);
          }
        }
      }
      return 0;
    }, data)(ctx);
  }
  leave(ctx, data?: any) {
    this._cursor(() => {
      return -1;
    }, data)(ctx);
  }
  _run() {
    return async (ctx) => {
      let info = await this._getId(ctx);
      if (info) {
        if (info.senderChatId && !this.ignoreSenderChat) {
          let user = this.users.get(`${info.chatId}_${info.senderChatId}`);
          if (user) {
            let fn = this.handlers.get(user.index);
            if (fn) {
              return fn(ctx, user.data);
            }
          } else {
            let sm = {
              isRunning: true,
              index: 0,
              data: {},
            };
            this.users.set(`${info.chatId}_${info.senderChatId}`, sm);
            let fn = this.handlers.get(0);
            if (fn) {
              return fn(ctx, sm.data);
            }
          }
        } else {
          let user = this.users.get(`${info.chatId}_${info.userId}`);
          if (user) {
            let fn = this.handlers.get(user.index);
            if (fn) {
              return fn(ctx, user.data);
            }
          } else {
            let sm = {
              isRunning: true,
              index: 0,
              data: {},
            };
            this.users.set(`${info.chatId}_${info.userId}`, sm);
            let fn = this.handlers.get(0);
            if (fn) {
              return fn(ctx, sm.data);
            }
          }
        }
      }
      return false;
    };
  }
  isRunning(ctx) {
    let info = this._getId(ctx);
    if (info) {
      if (info.senderChatId && !this.ignoreSenderChat) {
        let user = this.users.get(`${info.chatId}_${info.senderChatId}`);
        if (user) {
          return user.isRunning;
        }
      } else {
        let user = this.users.get(`${info.chatId}_${info.userId}`);
        if (user) {
          return user.isRunning;
        }
      }
    }
    return false;
  }
}
export class Stage {
  private scenes: Map<string, Scene> = new Map();
  ignoreSenderChat: boolean = false;
  constructor(...scenes: Array<Scene>) {
    for (let scene of scenes) {
      this.scenes.set(scene.id, scene);
    }
  }
  private _getId(ctx: Updates.TypeUpdate) {
    if (ctx instanceof ResultGetEntity) {
      ctx as ResultGetEntity;
      return {
        userId: ctx.id,
        chatId: ctx.id,
      } as userObject;
    }
    if (ctx instanceof MessageContext) {
      ctx as MessageContext;
      return {
        userId: ctx.from.id,
        senderChatId: ctx.senderChat && !ctx.isAutomaticForward ? ctx.senderChat?.id : undefined,
        chatId: ctx.chat.id,
      } as userObject;
    }
    if (ctx instanceof Updates.UpdateNewMessage) {
      ctx as Updates.UpdateNewMessage;
      let message = ctx.message as MessageContext;
      return {
        userId: message.from.id,
        chatId: message.chat.id,
        senderChatId:
          message.senderChat && !message.isAutomaticForward ? message.senderChat?.id : undefined,
      } as userObject;
    }
    if (ctx instanceof Updates.UpdateShortMessage) {
      ctx as Updates.UpdateShortMessage;
      let message = ctx.message as MessageContext;
      return {
        userId: message.from.id,
        chatId: message.chat.id,
        senderChatId:
          message.senderChat && !message.isAutomaticForward ? message.senderChat?.id : undefined,
      } as userObject;
    }
    if (ctx instanceof Updates.UpdateShortChatMessage) {
      ctx as Updates.UpdateShortChatMessage;
      let message = ctx.message as MessageContext;
      return {
        userId: message.from.id,
        chatId: message.chat.id,
        senderChatId:
          message.senderChat && !message.isAutomaticForward ? message.senderChat?.id : undefined,
      } as userObject;
    }
    if (ctx instanceof Updates.UpdateNewChannelMessage) {
      ctx as Updates.UpdateNewChannelMessage;
      let message = ctx.message as MessageContext;
      return {
        userId: message.from.id,
        chatId: message.chat.id,
        senderChatId:
          message.senderChat && !message.isAutomaticForward ? message.senderChat?.id : undefined,
      } as userObject;
    }
    if (ctx instanceof Updates.UpdateBotCallbackQuery) {
      ctx as Updates.UpdateBotCallbackQuery;
      let chatId = ctx.message ? ctx.message.chat.id : ctx.from.id;
      return {
        userId: ctx.from.id,
        chatId: chatId,
        senderChatId:
          ctx.message &&
          ctx.message.replyToMessage &&
          ctx.message.replyToMessage.senderChat &&
          !ctx.message.replyToMessage.isAutomaticForward
            ? ctx.message.replyToMessage.senderChat.id
            : undefined,
      } as userObject;
    }
    if (ctx instanceof Updates.UpdateBotInlineQuery) {
      ctx as Updates.UpdateBotInlineQuery;
      return {
        userId: ctx.from.id,
        chatId: ctx.from.id,
      } as userObject;
    }
  }
  middleware() {
    return (ctx, next) => {
      let a = Array.from(this.scenes);
      for (let [id, scene] of a) {
        let info = this._getId(ctx);
        if (info) {
          if (info.senderChatId && !this.ignoreSenderChat) {
            let user = scene.users.get(`${info.chatId}_${info.senderChatId}`);
            if (user) {
              if (user.isRunning) {
                scene.on('*', scene._run());
                return run(scene.middleware(), ctx);
              }
            }
          } else {
            let user = scene.users.get(`${info.chatId}_${info.userId}`);
            if (user) {
              if (user.isRunning) {
                scene.on('*', scene._run());
                return run(scene.middleware(), ctx);
              }
            }
          }
        }
      }
      return next();
    };
  }
  enter(sceneId: string) {
    return (ctx) => {
      let scene = this.scenes.get(sceneId);
      if (scene) {
        scene.on('*', scene._run());
        return run(scene.middleware(), ctx);
      }
      let a = Array.from(this.scenes);
      let b: string[] = [];
      for (let [key] of a) {
        b.push(`- ${key}\n`);
      }
      throw new WizardError(
        400,
        'Invalid SceneId',
        `Scene with id \`${sceneId}\` is undefined. Make sure you declare before.\nAvalible scene :\n${b.join(
          ''
        )}`
      );
    };
  }
}
