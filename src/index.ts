import cac from "cac"
import { Git } from "./modules"

const cli = cac('cau').version('1.0.0').help()

cli.command('git [count]', '按文件夹批量提交 count 一次操作的文件个数 默认10').action(Git)

cli.parse()