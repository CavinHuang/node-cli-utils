import path from "path"
import fs from 'fs'

function parseFormat(format: string) {
  const prefixReg = /\{[prefix|suffix]+:([a-zA-Z\d+_【】]+)+\}/ig
  const numberReg = /\{(number)\}/ig
  const prefixRes = format.matchAll(prefixReg)
  const numberRes = format.matchAll(numberReg)

  // console.log(result.next())
  const result = []
  const numberResult = []
  for (const item of numberRes) {
    numberResult.push(item)
  }
  for (const item of prefixRes) {
    result.push(item)
  }
  return [
    result,
    numberResult
  ]
}

export const Rename = (dir: string, format: string, filter: string) => {
  const cwd = process.cwd()
  const [result, numberResult] = parseFormat(format)

  let formatString = format
  // 处理前缀和后缀
  for (let i = 0; i < result.length; i++) {
    const [fullKey, key, index] = result[i]

    if (fullKey.includes('prefix')) {
      // 有前缀规则
      formatString = formatString.replace(fullKey, key)
    }

    
    if (fullKey.includes('suffix')) {
      // 有前缀规则
      formatString = formatString.replace(fullKey, key)
    }
  }

  const isAbsolutePath = /^\/[a-zA-Z\d_]+/ig.test(dir)
  const fullPath = isAbsolutePath ? dir : path.resolve(cwd, dir)

  if (!fs.existsSync(fullPath)) {
    throw new Error('文件夹不存在')
  }

  const files = fs.readdirSync(fullPath).map(dirStr => path.join(fullPath, dirStr)).filter((dirStr) => fs.statSync(dirStr).isFile())

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const ext = path.extname(file)
    
    let fileNewName = formatString
    if (/{number}/ig.test(formatString)) {
      fileNewName = fileNewName.replace(/\{number\}/ig, String(i+1))
    } else {
      fileNewName += `(${String(i+1)})`
    }

    fileNewName += `${ext}`

    fs.renameSync(file, path.join(fullPath, fileNewName))
  }
}