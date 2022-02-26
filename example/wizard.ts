import { Scene, Stage } from '@tgsnake/wizard-scenes';
import { Snake, Updates } from 'tgsnake';
import { MessageContext } from 'tgsnake/lib/Context/MessageContext';
const bot = new Snake();
const scene_one = new Stage(
  'scene_one',
  (ctx, data) => {
    if (ctx instanceof MessageContext) {
      ctx as MessageContext;
      ctx.reply('Please Input Your Number!');
      return scene_one.next(ctx, data);
    }
  },
  (ctx, data) => {
    if (ctx instanceof MessageContext) {
      ctx as MessageContext;
      data.number = ctx.text;
      ctx.reply('Please Input Your Name!');
      return scene_one.next(ctx, data);
    }
  },
  (ctx, data) => {
    if (ctx instanceof MessageContext) {
      ctx as MessageContext;
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
bot.cmd('login', stage.enter('scene_one'));
bot.run();
