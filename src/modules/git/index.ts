import path from "path";
import fs from "fs";
import simpleGit from "simple-git";

const doGitAction = async (files: string[]) => {
  const git = simpleGit();

  git.addConfig("proxy", "http://127.0.0.1:4780");

  git.outputHandler((command, stdout, stderr) => {
    stdout.on('data', (data) => {
      console.log(data.toString())
    })
  })


  // git add
  // const files = fs.readdirSync(path.normalize(dirPath)).map((dir) => {
  //   return path.join(dirPath, dir);
  // });
  console.log(files);
  await git.add(files, (error) => {
    if (error) {
      throw error;
    }
    console.log("添加文件成功");
  });

  // git commit
  await git.commit("update files", (error) => {
    if (error) {
      throw error;
    }
    console.log("commit成功");
  });

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
  console.log("当前操作目录", cwd);
  const isAbsolvePath = /^[\/\\]/.test(gitPath);
  let activePath = gitPath;
  if (!isAbsolvePath) {
    activePath = path.resolve(cwd, gitPath);
  }

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

  function sliceArray (arr: Array<any>, num = 10) {
    let index = 0
    const newArray: Array<any> = []
    const l = arr.length

    while (index < l) {
      newArray.push(arr.splice(index, index += num))
    }

    return newArray
  }

  dirs.forEach((dir, index) => {
    const items = fs.statSync(dir).isDirectory()
      ? fs.readdirSync(dir).map((_p) => path.join(dir, _p))
      : [];
    files.push(...sliceArray(items, 10))
  });

  console.log(files);

  // const tasks = files.map(fss => doGitAction(fss))

  for (let i = 0; i < files.length; i++) {
    console.log("开始执行", i);
    await doGitAction(files[i]);
  }
};
