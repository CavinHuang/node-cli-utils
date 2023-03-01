import cac from "cac"
import { Git, Rename } from "./modules"

const cli = cac('cau').version('1.0.0').help()

cli.command('git [count]', '按文件夹批量提交 count 一次操作的文件个数 默认10').action(Git)

cli.command('rename [dir] [format] [filter]', '批量重命名文件， dir父级文件夹 format 命名格式[number]代表数字[prefix|p]前缀[suffix|s]后缀eg:{prefix:test}测试文件{number}{suffix:end} filter过滤需要操作的文件').action(Rename)

cli.parse()