import simpleGit from "simple-git";

const git = simpleGit();
git.addConfig("proxy", "http://127.0.0.1:4780");

function sliceArray (arr: Array<any>, num = 10) {
  const newArray: Array<any> = []

  while (arr.length) {
    newArray.push(arr.splice(0, num))
  }

  return newArray
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

export const Git = async (count: number = 10) => {

  const status = await git.status()

  const notAdd = status.not_added

  const needAdds = sliceArray(notAdd, count)

  for (let i = 0; i < needAdds.length; i++) {
    await doGitAction(needAdds[i]);
  }
  return false
};
