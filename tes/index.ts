import {Snake,Updates,Composer} from "tgsnake"
import {MessageContext} from "tgsnake/lib/Context/MessageContext"
import {Stage,Scene} from "../src"
const bot = new Snake()
const scene_one = new Scene(
    "scene_one",
    (ctx,data) => {
      //@ts-ignore
      ctx.message.reply("please input your number!",{
        replyMarkup : {
          inlineKeyboard : [[{
            text : "cancel",
            callbackData : "cancel"
          }]]
        }
      })
      return scene_one.next(ctx,data)
    },
    (ctx,data) => {
      //@ts-ignore
      ctx.reply("input your name!",{
        replyMarkup : {
          inlineKeyboard : [[{
            text : "cancel",
            callbackData : "cancel"
          }]]
        }
      }) 
      //@ts-ignore
      data.number = ctx.text
      return scene_one.next(ctx,data)
    },
    (ctx,data) => {
      //@ts-ignore 
      ctx.reply(`your number : ${data.number}\nyour name : ${ctx.text}`) 
      return scene_one.leave(ctx,{})
    }
  )
scene_one.use((ctx,next)=>{
  console.log(ctx,scene_one)
  next()
})
/*scene_one.action("cancel",(ctx)=>{
  if(!scene_one.isRunning(ctx)){
    return ctx.message.reply("no scenes running!")
  }
  ctx.message.reply("leaving from current scenes")
  return scene_one.leave(ctx,{})
})*/
const stage = new Stage(scene_one)
bot.use(stage.middleware()); 
bot.cmd("start",(ctx)=>{
  ctx.reply("Click button bellow to start scene",{
    replyMarkup : {
      inlineKeyboard : [
          [{
            text : "Login",
            callbackData : "login"
          }]
        ]
    }
  })
})
bot.action("login",stage.enter("scene_one"))
/*bot.action("cancel",(ctx)=>{
  if(!scene_one.isRunning(ctx)){
    return ctx.message?.reply("no scenes running!")
  }
  ctx.message?.reply("leaving from current scenes")
  return scene_one.leave(ctx,{})
})*/
bot.run()