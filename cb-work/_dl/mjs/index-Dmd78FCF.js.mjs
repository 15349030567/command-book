const t=[{name:"撤销最后一次提交（保留修改）",description:"撤销最后一次 git commit，但保留所有修改在工作区——适合刚刚提交完发现漏了东西或提交信息写错的情况。",fullCommand:`# 撤销提交，修改回到暂存区
git reset --soft HEAD~1

# 如果需要修改提交信息，修改后重新提交
git commit -m "new message"`,steps:[{description:"撤销最近一次提交，修改回到暂存区（安全，不丢代码）",code:"git reset --soft HEAD~1"},{description:"修改文件后重新暂存",code:"git add ."},{description:"重新提交",code:'git commit -m "corrected message"'}],tags:["撤销","reset","提交","安全","soft"],category:"stash-undo",type:"sequence",lang:"bash"},{name:"修改最近一次提交 — commit --amend",description:"快速修改最近一次提交——无论是追加遗漏的文件还是修改提交信息。注意：只能修改未推送的提交。",fullCommand:`# 追加修改到上一次提交
git add forgotten-file.js
git commit --amend --no-edit

# 或只修改提交信息
git commit --amend -m "new message"`,steps:[{description:"先暂存遗漏的修改",code:"git add forgotten-file.js"},{description:"追加到上一次提交（保持原提交信息）",code:"git commit --amend --no-edit"},{description:"如果只想改提交信息而不改内容",code:'git commit --amend -m "修正后的提交信息"'}],tags:["amend","提交","修改","追加","修正"],category:"basic",type:"pattern",lang:"bash"},{name:"交互式合并提交 — rebase -i 压缩",description:"使用交互式 rebase 将多个零散提交压缩成一个干净提交——在推送前整理提交历史的常用操作。",fullCommand:`# 压缩最近 3 次提交
git rebase -i HEAD~3

# 在编辑器中：保留第一个 pick，其余改为 squash (s)
# pick a1b2c3d first commit
# squash d4e5f6g second commit
# squash h7i8j9k third commit

# 保存后编辑合并后的提交信息`,steps:[{description:"进入交互式 rebase（最近 N 次提交）",code:"git rebase -i HEAD~3"},{description:"在编辑器中：第一个保持 pick，其余改为 squash 或 s",code:`# pick a1b2c3d 保留第一个
# s d4e5f6g 合并到上一个
# s h7i8j9k 合并到上一个`},{description:"保存退出后编辑合并后的提交信息",code:"# 在第二个编辑器中编写最终的提交信息"},{description:"如果冲突，解决后继续",code:"git rebase --continue"}],tags:["rebase","squash","压缩","整理","历史","清理"],category:"branch",type:"sequence",lang:"bash"},{name:"抢救误删分支 — reflog 救援",description:"误删分支后用 reflog 找回丢失的提交——reflog 记录了所有 HEAD 变动，即使 branch -D 了也能恢复。",fullCommand:`# 查看 HEAD 的所有历史变动
git reflog

# 找到被删除分支指向的最后一次提交 SHA
git branch recovered-branch HEAD@{3}

# 或直接恢复该提交
git checkout -b recovered-branch a1b2c3d`,steps:[{description:"查看 HEAD 变更历史（找到你最后一次在那个分支上的位置）",code:"git reflog"},{description:"从 reflog 中找到目标提交（如 HEAD@{3}），创建新分支恢复",code:"git branch recovered-branch HEAD@{3}"},{description:"切换过去确认数据完好",code:"git checkout recovered-branch"}],tags:["reflog","恢复","误删","救援","分支","提交"],category:"inspect",type:"sequence",lang:"bash"},{name:"临时保存工作 — stash 暂存",description:"工作中被打断需要切换分支时：stash 暂存当前修改 → 切换分支处理 → 回来 stash pop 恢复。",fullCommand:`# 暂存当前所有修改
git stash push -m "WIP: refactoring auth module"

# 切换分支处理紧急事务
git checkout hotfix
# ... 修复并提交 ...

# 回到原分支恢复工作
git checkout feature/auth
git stash pop`,steps:[{description:"暂存当前工作区的所有修改",code:'git stash push -m "WIP: refactoring auth module"'},{description:"切换分支处理其他事情",code:"git checkout hotfix"},{description:"回来恢复暂存的修改",code:`git checkout feature/auth
git stash pop`},{description:"如果有多个 stash 项，先查看列表",code:"git stash list"}],tags:["stash","暂存","打断","切换","恢复"],category:"stash-undo",type:"pattern",lang:"bash"},{name:"cherry-pick 跨分支搬运",description:"将某个分支上的特定提交搬运到当前分支——不需要合并整个分支，只取需要的提交。",fullCommand:`# 先找到要搬运的提交 SHA
git log --oneline feature/other

# 搬运单个提交
git cherry-pick a1b2c3d

# 搬运连续的多个提交
git cherry-pick a1b2c3d..e4f5g6h`,steps:[{description:"找到要搬运的提交 SHA",code:"git log --oneline feature/other"},{description:"将指定提交应用到当前分支",code:"git cherry-pick a1b2c3d"},{description:"如有冲突，解决后继续",code:"git cherry-pick --continue"},{description:"如果不想要了，放弃整个 cherry-pick",code:"git cherry-pick --abort"}],tags:["cherry-pick","搬运","提交","跨分支","移植"],category:"branch",type:"sequence",lang:"bash"},{name:"分支清理 — 删除已合并分支",description:"定期清理本地和远程已合并的分支，保持仓库整洁。",fullCommand:`# 查看已合并到 main 的分支
git branch --merged main

# 批量删除本地已合并分支（排除 main 和 develop）
git branch --merged main | grep -v 'main\\|develop' | xargs git branch -d

# 清理本地已不存在的远程分支引用
git fetch --prune`,steps:[{description:"列出已合并到 main 的分支（确认无误）",code:"git branch --merged main"},{description:"删除已合并的本地分支（排除 main/develop）",code:"git branch --merged main | grep -v 'main\\|develop' | xargs git branch -d"},{description:"清理远程已删除的分支引用",code:"git fetch --prune"}],tags:["分支","清理","删除","合并","整洁"],category:"branch",type:"sequence",lang:"bash"},{name:"首次推送新仓库 — init + push -u",description:"将本地新项目推送到 GitHub/GitLab 远程仓库的完整流程——从初始化到首次推送。",fullCommand:`# 本地初始化
git init --initial-branch=main
git add -A
git commit -m "Initial commit"

# 关联远程并推送
git remote add origin https://github.com/user/repo.git
git push -u origin main`,steps:[{description:"初始化仓库并指定主分支为 main",code:"git init --initial-branch=main"},{description:"暂存所有文件并首次提交",code:`git add -A
git commit -m "Initial commit"`},{description:"添加远程仓库",code:"git remote add origin https://github.com/user/repo.git"},{description:"推送并设置上游追踪",code:"git push -u origin main"}],tags:["初始化","推送","远程","首次","setup"],category:"basic",type:"sequence",lang:"bash"},{name:"撤销已推送的提交 — revert（安全回滚）",description:"线上代码需要回滚时，用 git revert 创建反向提交——不改写历史，团队协作安全。⚠️ 切勿对已推送的提交使用 git reset --hard + force push。",fullCommand:`# 撤销单个已推送的提交
git revert a1b2c3d

# 提交并推送
git push

# 撤销多个连续提交（注意顺序：最新的先撤销）
git revert HEAD~3..HEAD`,steps:[{description:"找到要撤销的提交 SHA",code:"git log --oneline -5"},{description:"revert 该提交（产生新提交，不改历史）",code:"git revert a1b2c3d"},{description:"如果有冲突，解决后继续",code:"git revert --continue"},{description:"推送到远程",code:"git push"}],tags:["revert","回滚","撤销","安全","线上","推送"],category:"branch",type:"sequence",lang:"bash"},{name:"从历史中恢复误删文件",description:"文件被误删并提交了？只要曾经提交过就能从 Git 历史中找回——用 checkout 或 restore 从旧版本中恢复。",fullCommand:`# 1. 找到该文件最后一次存在的提交
git log --diff-filter=D --oneline -- deleted-file.txt

# 2. 从删除前的那个提交恢复文件
git checkout <commit-before-delete> -- deleted-file.txt

# 或使用 restore（Git 2.23+）
git restore --source=<commit-before-delete> deleted-file.txt`,steps:[{description:"查找删除该文件的提交",code:"git log --diff-filter=D --oneline -- deleted-file.txt"},{description:"从删除前的提交中恢复文件",code:"git checkout a1b2c3d^ -- deleted-file.txt"},{description:"提交恢复",code:`git add deleted-file.txt
git commit -m "recover deleted-file.txt"`}],tags:["恢复","文件","误删","checkout","历史","找回"],category:"basic",type:"sequence",lang:"bash"},{name:"同步 Fork 仓库 — upstream 更新",description:"你在 GitHub 上 fork 的仓库落后于原始仓库时，添加 upstream 远程并合并更新——保持 fork 与上游同步。",fullCommand:`# 1. 添加原始仓库为 upstream（只需一次）
git remote add upstream https://github.com/original/repo.git

# 2. 拉取上游最新代码
git fetch upstream

# 3. 切换到 main 并合并上游
git checkout main
git merge upstream/main

# 4. 推送到自己的 fork
git push origin main`,steps:[{description:"添加上游仓库为 remote（只需执行一次）",code:"git remote add upstream https://github.com/original/repo.git"},{description:"拉取上游所有更新",code:"git fetch upstream"},{description:"合并上游 main 到本地 main",code:`git checkout main
git merge upstream/main`},{description:"推送到自己的 fork",code:"git push origin main"}],tags:["fork","upstream","同步","远程","更新"],category:"remote",type:"sequence",lang:"bash"},{name:"解决合并冲突 — 完整流程",description:"merge 或 rebase 时遇到冲突不要慌——先定位冲突文件，再手动或用 mergetool 解决，最后标记完成。推荐使用 git mergetool（自动调起 VS Code 等可视化工具）。",fullCommand:`# 1. 查看冲突文件列表
git status

# 2a. 手动解决：打开文件，编辑冲突标记
# <<<<<<< HEAD
# 你的修改
# =======
# 对方的修改
# >>>>>>> feature-branch

# 2b. 或用 mergetool 可视化解决
git mergetool

# 3. 标记已解决
git add resolved-file.js

# 4. 结束合并——以下三种方式等价，任选一种：
git commit                          # 传统做法，一直可用
git merge --continue               # Git 2.22+，更语义化
git rebase --continue              # 仅 rebase 冲突时使用`,steps:[{description:"查看哪些文件有冲突",code:"git status"},{description:"方式一：手动编辑冲突文件，删除 <<<<<<< / ======= / >>>>>>> 标记",code:"# 打开文件，保留需要的内容，删除冲突标记行"},{description:"方式二：用可视化工具解决（推荐，自动调起 VS Code/vimdiff 等）",code:"git mergetool"},{description:"标记冲突已解决",code:"git add resolved-file.js"},{description:"结束合并——git commit（传统）或 git merge --continue（Git 2.22+），rebase 冲突则用 git rebase --continue",code:"git commit  # 或 git merge --continue (Git 2.22+)"}],tags:["冲突","merge","conflict","解决","mergetool"],category:"branch",type:"sequence",lang:"bash"},{name:"忽略已追踪文件的本地修改",description:"有些配置文件（如 database.yml）需要本地修改但不能提交——用 update-index --skip-worktree 让 Git 假装文件没动过。",fullCommand:`# 告诉 Git 忽略此文件的本地修改
git update-index --skip-worktree config/database.yml

# 查看被 skip-worktree 标记的文件
git ls-files -v | grep '^S'

# 恢复追踪（需要提交本地修改时）
git update-index --no-skip-worktree config/database.yml`,steps:[{description:"标记文件为跳过工作树更新",code:"git update-index --skip-worktree config/database.yml"},{description:"查看当前被标记的文件",code:"git ls-files -v | grep '^S'"},{description:"恢复对该文件的追踪",code:"git update-index --no-skip-worktree config/database.yml"}],tags:["忽略","本地","配置","skip-worktree","环境","保密"],category:"stash-undo",type:"pattern",lang:"bash"},{name:"精细暂存 — git add -p 部分提交",description:"一个文件改了 10 处，只想提交其中 3 处——git add -p 逐块确认，把一个大修改拆成多个语义清晰的提交。",fullCommand:`# 交互式逐块暂存
git add -p

# 逐块操作提示：
# y - 暂存此块
# n - 跳过此块
# s - 拆分成更小的块
# e - 手动编辑此块
# q - 退出`,steps:[{description:"启动交互式暂存",code:"git add -p src/app.js"},{description:"对每个修改块确认：y=暂存 n=跳过 s=拆分 e=编辑 q=退出",code:"# 按 y 暂存当前修改块，按 n 跳过"},{description:"提交已选择的修改",code:'git commit -m "第一部分：重构 API 层"'},{description:"再次 add -p 提交剩余修改",code:`git add -p
git commit -m "第二部分：优化渲染逻辑"`}],tags:["add -p","暂存","精细","拆分","提交","交互"],category:"basic",type:"pattern",lang:"bash"},{name:"压缩整个分支为一个提交 — reset --soft",description:"分支上零零散散 30 个提交，合并前想压缩成一个干净提交——用 reset --soft 回到 main，再新建一个包含所有修改的提交。",fullCommand:`# 方法：回到 main，soft reset，重新提交
git checkout feature/xyz
git reset --soft main
git commit -m "feat: add user dashboard with real-time stats"

# 等效于：把所有零散提交压缩为一个有意义的提交`,steps:[{description:"确保当前在要压缩的分支上",code:"git checkout feature/xyz"},{description:"soft reset 到 main——修改全部回到暂存区，但提交记录消失",code:"git reset --soft main"},{description:"查看暂存区内容确认无误",code:"git status"},{description:"新建一个干净提交",code:'git commit -m "feat: complete feature description"'},{description:"（可选）强制推送到远程（⚠️如已存在远程分支需 --force）",code:"git push --force-with-lease origin feature/xyz"}],tags:["压缩","squash","reset --soft","整理","提交","分支"],category:"branch",type:"sequence",lang:"bash"},{name:"查找删除某文件的提交",description:"排查「xxx 文件怎么没了」——用 log --diff-filter=D 定位是哪个提交删除了某个文件。",fullCommand:`# 查找删除指定文件的提交
git log --diff-filter=D --oneline -- path/to/deleted-file

# 查看删除时的完整 diff
git log --diff-filter=D -p -- path/to/deleted-file

# 用 rev-list 统计
# 找到删除该文件的所有提交 SHA 并查看详情`,steps:[{description:"查找删除该文件的所有提交",code:"git log --diff-filter=D --oneline -- path/to/deleted-file"},{description:"查看最后一次删除的详细信息",code:"git log --diff-filter=D -p -1 -- path/to/deleted-file"},{description:"如果需要恢复，从删除提交的前一个提交捞回来",code:"git checkout <commit>^ -- path/to/deleted-file"}],tags:["删除","文件","查找","diff-filter","排查","log"],category:"inspect",type:"pattern",lang:"bash"},{name:"查看分支间差异提交 — log .. 双点语法",description:"快速查看「我的分支比 main 多了哪些提交」或反过来——双点语法是比较分支的利器。",fullCommand:`# 查看 feature 有但 main 没有的提交
git log main..feature --oneline

# 查看 main 有但 feature 没有的提交
git log feature..main --oneline

# 三点语法：查看两边各自独有的提交
git log main...feature --oneline --left-right`,steps:[{description:"查看当前分支领先 main 多少提交",code:"git log main..HEAD --oneline"},{description:"查看 main 比当前分支多了什么",code:"git log HEAD..main --oneline"},{description:"三点语法：看哪些是 main 的、哪些是 feature 的",code:"git log main...feature --oneline --left-right"}],tags:["差异","log","范围","比较","分支",".."],category:"branch",type:"pattern",lang:"bash"},{name:"从远程检出分支 — fetch + switch",description:"同事推了一个新分支，你本地没有——先 fetch 拉取远程引用，再 switch -c 创建本地跟踪分支。",fullCommand:`# 1. 拉取远程最新引用
git fetch origin

# 2. 基于远程分支创建本地分支
git switch -c feature/new-api origin/feature/new-api

# 3. 或者在一行搞定
git fetch origin feature/new-api && git switch -c feature/new-api origin/feature/new-api`,steps:[{description:"拉取远程分支列表",code:"git fetch origin"},{description:"查看远程有哪些分支可用",code:"git branch -r"},{description:"创建本地分支并跟踪远程分支",code:"git switch -c feature/new-api origin/feature/new-api"}],tags:["远程","检出","fetch","switch","分支","跟踪"],category:"remote",type:"pattern",lang:"bash"},{name:"查看 stash 详细内容 — stash show",description:"有多个 stash 但忘了每个里面存了什么——stash show -p 查看 stash 的完整 diff，stash list 看列表。",fullCommand:`# 列出所有 stash
git stash list

# 查看最近 stash 的完整 diff
git stash show -p

# 查看指定 stash（如 stash@{2}）的 diff
git stash show -p stash@{2}`,steps:[{description:"先看所有 stash 列表",code:"git stash list"},{description:"查看某个 stash 的统计信息（文件名 + 修改行数）",code:"git stash show stash@{0}"},{description:"查看完整 diff（确认里面到底藏了什么）",code:"git stash show -p stash@{0}"}],tags:["stash","查看","diff","暂存","检查"],category:"stash-undo",type:"pattern",lang:"bash"},{name:"自动化 bisect 排查 — git bisect run",description:"如果测试脚本能判断 bug 是否存在，可以用 bisect run 全自动二分定位——Git 自动 checkout 不同版本并运行测试，直到找到引入 bug 的提交。",fullCommand:`# 1. 开始 bisect
git bisect start

# 2. 标记好坏
git bisect bad HEAD
git bisect good v1.0.0

# 3. 自动运行测试脚本
git bisect run npm test

# 4. 找到后结束
git bisect reset`,steps:[{description:"开始二分查找",code:"git bisect start"},{description:"标记最新为坏、旧版本为好",code:`git bisect bad HEAD
git bisect good v1.0.0`},{description:"让测试脚本自动判断（返回 0=good, 1-127=bad）",code:"git bisect run npm test"},{description:"Git 自动二分查找，找到后输出第一次失败的提交",code:"# 完成后执行 git bisect reset 回到正常状态"}],tags:["bisect","自动化","bug","定位","测试","二分"],category:"inspect",type:"sequence",lang:"bash"},{name:"拆分一个提交为多个小提交 — reset + add -p",description:"已经提交了一大坨修改，想拆分回多个语义独立的提交——先用 soft reset 回到暂存，再用 add -p 分批提交。",fullCommand:`# 假设最新一次提交包含了 3 个不相关的修改
git reset --soft HEAD~1

# 现在所有修改回到暂存区，分批提交
git reset HEAD .                  # 先把所有文件移出暂存区
git add -p src/api.js             # 精细挑选：只暂存 API 相关修改
git commit -m "refactor: API layer"
git add src/cache.js              # 第二批：缓存层
git commit -m "perf: add cache layer"
git add src/ui.js                 # 第三批：UI
git commit -m "feat: new dashboard UI"`,steps:[{description:"soft reset 撤销提交，修改回到暂存区",code:"git reset --soft HEAD~1"},{description:"把所有文件从暂存区移出（回到工作区）",code:"git reset HEAD ."},{description:"逐文件或逐块暂存第一批修改",code:"git add -p src/api.js"},{description:"提交第一批",code:'git commit -m "refactor: API layer"'},{description:"同样方式提交第二批、第三批...",code:`git add src/cache.js
git commit -m "perf: add cache layer"`}],tags:["拆分","reset","add -p","提交","分解","整理"],category:"basic",type:"sequence",lang:"bash"},{name:"清除已提交的敏感数据 — git filter-repo",description:"密码、密钥或大文件不小心提交了——用 git filter-repo（现代化替代 filter-branch）从整个历史中彻底删除。⚠️ 会重写历史，协作分支需全员重新克隆。",fullCommand:`# 安装 filter-repo（首次使用）
pip install git-filter-repo

# 从所有历史中删除某个文件
git filter-repo --path secrets/credentials.json --invert-paths

# 从所有历史中删除匹配 pattern 的文件
git filter-repo --path-glob '*.pem' --invert-paths

# 替换历史中的敏感字符串
git filter-repo --replace-text <(echo 'old-password==>REDACTED')`,steps:[{description:"先备份仓库（或确保远程有最新副本）",code:"git clone --mirror <repo> backup.git  # 安全操作"},{description:"安装 git-filter-repo 工具",code:"pip install git-filter-repo"},{description:"从整个 Git 历史中彻底删除指定文件",code:"git filter-repo --path secrets/credentials.json --invert-paths"},{description:"强制推送到远程（⚠️通知协作者重新克隆）",code:`git push --force origin --all
git push --force origin --tags`}],tags:["敏感数据","安全","filter-repo","重写历史","清理","密码"],category:"stash-undo",type:"sequence",lang:"bash"},{name:"git rebase --onto 详解 — 精准移植提交",description:"--onto 是 rebase 最强大也最让人困惑的选项：将一段提交范围「嫁接」到新的基础上。典型场景——feature 分支基于 develop，但 develop 已合并进 main，现在想让 feature 直接基于 main。",fullCommand:`# 语法：git rebase --onto <新基底> <旧基底> <分支>
# 含义：取出「旧基底..分支」之间的所有提交，嫁接到「新基底」上

# 场景：feature 基于 develop，main 已包含 develop 的更新
# 用 merge-base 找到分叉点
git checkout feature
git rebase --onto main $(git merge-base develop feature) feature

# 等价于：把 feature 的独有提交移植到 main 上`,steps:[{description:"理解 --onto 的三参数含义",code:`# git rebase --onto <新基底> <旧基底> <分支>
# 取 <旧基底> 到 <分支> 之间的提交，嫁接到 <新基底> 上`},{description:"找到 feature 分支与 develop 的分叉点",code:"git merge-base develop feature"},{description:"将 feature 的独有提交嫁接到 main 上",code:`git checkout feature
git rebase --onto main $(git merge-base develop feature)`},{description:"如果有冲突，解决后继续",code:"git rebase --continue"}],tags:["rebase","--onto","嫁接","移植","分支","高级"],category:"branch",type:"sequence",lang:"bash"}],i=t.map(e=>({...e,_type:"recipe"}));export{i as ALL_RECIPES};
