import cac from "cac"
import { Git } from "./modules"

const cli = cac('cau').version('1.0.0').help()

cli.command('git [dir] [deep]', '按文件夹批量提交 dir 文件夹路径 deep 文件夹深度').action(Git)

cli.parse()