import {Snake,Updates,Composer} from "tgsnake"
import {MessageContext} from "tgsnake/lib/Context/MessageContext"
import {Stage,Scene} from "../src"
const bot = new Snake()
const scene_one = new Scene(
    "scene_one",
    (ctx,data) => {
      //@ts-ignore
      ctx.reply("please input your number!")
      return scene_one.next(ctx,data)
    },
    (ctx,data) => {
      //@ts-ignore
      ctx.reply("input your name!") 
      //@ts-ignore
      data.number = ctx.text
      return scene_one.next(ctx,data)
    },
    (ctx,data) => {
      //@ts-ignore 
      ctx.reply(`your number : ${data.number}\nyour name : ${ctx.text}`) 
      return scene_one.leave(ctx,data)
    }
  )
const stage = new Stage(scene_one)
bot.use(stage.middleware()); 
bot.cmd("start",(ctx)=>{
  ctx.reply("running..")
})
bot.cmd("login",stage.enter("scene_one"))
bot.run()