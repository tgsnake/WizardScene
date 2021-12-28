const { Scene, Stage } = require('@tgsnake/wizard-session');
const { Snake, Updates } = require('tgsnake');
const { MessageContext } = require('tgsnake/lib/Context/MessageContext');
const bot = new Snake();
const scene_one = new Stage(
  'scene_one',
  (ctx, data) => {
    if (ctx instanceof Updates.UpdateBotCallbackQuery) {
      ctx.message.reply('Please Input Your Number!', {
        replyMarkup: {
          inlineKeyboard: [
            [
              {
                text: 'Cancel',
                callbackData: 'cancel',
              },
            ],
          ],
        },
      });
      return scene_one.next(ctx, data);
    }
  },
  (ctx, data) => {
    if (ctx instanceof MessageContext) {
      data.number = ctx.text;
      ctx.reply('Please Input Your Name!', {
        replyMarkup: {
          inlineKeyboard: [
            [
              {
                text: 'Cancel',
                callbackData: 'cancel',
              },
            ],
          ],
        },
      });
      return scene_one.next(ctx, data);
    }
  },
  (ctx, data) => {
    if (ctx instanceof MessageContext) {
      ctx.reply(`Your Name : ${ctx.text}\n Your Number : ${data.number}`);
      return scene_one.leave(ctx, data);
    }
  }
);
scene_one.cmd('cancel', (ctx) => {
  if (scene_one.isRunning(ctx)) {
    ctx.reply('Leaving from current scenes');
    return scene_one.leave(ctx, {});
  }
});
/*const scene_two = new Scene()*/
const stage = new Stage(scene_one /*,scene_two,scene_three,ect...*/);
bot.use(stage.middleware());
bot.cmd('login', (ctx) => {
  return ctx.reply('Click button bellow to start login.', {
    replyMarkup: {
      inlineKeyboard: [
        [
          {
            text: 'Login',
            callbackData: 'login',
          },
        ],
      ],
    },
  });
});
bot.action('login', stage.enter('scene_one'));
bot.action('cancel', (ctx) => {
  if (!scene_one.isRunning(ctx)) {
    return ctx.message.reply('no scenes running!');
  }
  ctx.message.reply('leaving from current scenes');
  return scene_one.leave(ctx, {});
});
bot.run();
