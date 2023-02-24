import path from "path";
import fs from "fs";
import simpleGit from "simple-git";
import utf8 from 'utf8'
import encoding from 'encoding'
import { execaCommandSync } from 'execa'
import { Stream } from "stream";

const git = simpleGit();
git.addConfig("proxy", "http://127.0.0.1:4780");

function Octal2Chinese(str: string) {
  const matches = str.match(/(\\\d{3}){3}/g);
  if (matches) matches.forEach(match => {
    let encoded = '';
    const splits = match.split('\\');
    splits.forEach(code => !code || (encoded += '%' + parseInt(code, 8).toString(16)));
    const cChar = encoded//decodeURIComponent(encoded);
    str = str.replace(match, cChar);
  });
  return str;
}

function sliceArray (arr: Array<any>, num = 10) {
  let index = 0
  const newArray: Array<any> = []
  const l = arr.length

  while (index < l) {
    newArray.push(arr.splice(index, num))
    index += num
  }

  return newArray
}

const getGitFiles = (gitPath: string) => {

  const stream = new Stream()

  const result = execaCommandSync('git ls-files', {
    cwd: gitPath,
    buffer: true
  })

  console.log(Buffer.from(result.stdout).toString('utf8'))
  // const strs = result.stdout.replace(/\\/g, '\\')

  // console.log(str)

  // return result.stdout.split('\n')
}

const doGitAction = async (files: string[]) => {

  // git.outputHandler((command, stdout, stderr) => {
  //   stdout.on('data', (data) => {
  //     console.log(data.toString())
  //   })
  // })


  // git add
  // const files = fs.readdirSync(path.normalize(dirPath)).map((dir) => {
  //   return path.join(dirPath, dir);
  // });
  console.log(files);
  try {
    const result = await git.add(files);
    if (result.includes('nothing added to commit')) {
      console.log('已经存在的文件跳过');
      return
    }
    console.log('添加成功')
  } catch (error) {
    // nothing added to commit
    console.log(error)
  }


  // git commit
  try {
    const result = await git.commit("update files");
    console.log("commit成功", result);
    if (result.summary.changes === 0 && result.summary.deletions === 0 && result.summary.insertions === 0) return false
  } catch (error) {
    console.log(error)
  }

  // git push
  let retry = 0;
  async function push() {
    try {
      await git.push()
      console.log("push成功");
    } catch (error) {
      if (error) {
        console.error(error)
        retry++;
        console.log('开始重试', retry);
        await new Promise((resolve => {
          setTimeout(async () => {
            resolve(true)
        }, 1000)
        }))
        await push();
      }
    }
  }
  await push();
};

export const Git = async (gitPath = "", deep = 1) => {
  if (!gitPath) {
    throw new Error("不存在操作目录参数");
  }

  const cwd = process.cwd();

  const status = await git.status()

  const notAdd = status.not_added

  const needAdds = sliceArray(notAdd)

  for (let i = 0; i < needAdds.length; i++) {
    await doGitAction(needAdds[i]);
  }
  console.log()
  return false
  console.log("当前操作目录", cwd);
  const isAbsolvePath = /^[\/\\]/.test(gitPath);
  let activePath = gitPath;
  // if (!isAbsolvePath) {
  //   activePath = path.resolve(cwd, gitPath);
  // }

  const activeDirs = fs.readdirSync(path.normalize(activePath));

  const taskFiles = activeDirs.map((dir) => {
    const fullDirPath = path.join(activePath, dir);
    return fullDirPath;
  });

  let dirs: string[] = [...taskFiles];

  while (deep - 1 > 0) {
    const _temp = taskFiles.map((parentPath) => {
      if (fs.statSync(parentPath).isDirectory()) {
        const _childFiles = fs.readdirSync(parentPath);
        return _childFiles;
      }
      return "";
    });
    dirs = _temp.filter((item) => item).flat(1);
    deep--;
  }

  let files: string[][] = [];



  dirs.forEach((dir, index) => {
    const items = fs.statSync(dir).isDirectory()
      ? fs.readdirSync(dir).map((_p) => path.join(dir, _p))
      : [];
    files.push(...sliceArray(items, 10))
  });

  // console.log(JSON.parse(JSON.stringify(files)));

  fs.writeFileSync('./cache.txt', JSON.stringify(files, null, 2))




  // getGitFiles(activePath)

  // await doGitAction(['./cache.txt'])
  

  // const tasks = files.map(fss => doGitAction(fss))

  for (let i = 0; i < files.length; i++) {
    console.log("开始执行", i);
    // files[i].forEach(str => {
    //   console.log(Buffer.from(str).compare());
    // })
    
    await doGitAction(files[i]);
  }
};
