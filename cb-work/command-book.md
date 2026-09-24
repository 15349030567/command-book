# Command Book — 命令速查

> 中文描述搜命令：Linux / Redis / Git 命令速查与配方，支持收藏、最近查看。
> 数据来源：https://11052022.github.io/command-book-web/
> 共 298 条命令 · 61 个配方（Linux 155/20，Redis 103/18，Git 40/23）

---

## 🐧 Linux

### 命令（155 条）

#### 磁盘存储

**blkid**　`低危`

> 查看块设备的 UUID 和文件系统类型

**语法：**

```bash
blkid [选项] [设备]
```

**常用参数：**
- `-s`：只显示指定标签
- `-o`：指定输出格式

**示例：**

1. 查看所有块设备 UUID

   ```bash
   blkid
   ```

2. 查看指定设备

   ```bash
   blkid /dev/sda1
   ```

3. 只显示 UUID

   ```bash
   blkid -s UUID /dev/sda1
   ```

**相关命令：** `lsblk`、`findfs`、`mount`、`fstab`

**标签：** UUID、块设备、查看、磁盘、标识

---

**dd**　`极高危`

> 按块复制和转换文件（常用于制作启动盘）

**语法：**

```bash
dd if=输入 of=输出 [选项]
```

**常用参数：**
- `bs`：块大小（如 4M）
- `count`：复制的块数
- `status`：进度显示（status=progress）

**示例：**

1. 制作 USB 启动盘（危险！确保 of 正确）

   ```bash
   sudo dd if=ubuntu.iso of=/dev/sdb bs=4M status=progress
   ```

2. 备份整个磁盘

   ```bash
   sudo dd if=/dev/sda of=/backup/disk.img bs=4M status=progress
   ```

3. 创建指定大小的文件

   ```bash
   dd if=/dev/zero of=testfile bs=1M count=100
   ```

**相关命令：** `cp`、`cat`、`pv`

**标签：** 复制、磁盘、备份、克隆、写入、镜像、USB

---

**fdisk**　`极高危`

> 磁盘分区管理工具

**语法：**

```bash
fdisk [选项] 设备
```

**常用参数：**
- `-l`：列出所有分区表

**示例：**

1. 列出所有分区

   ```bash
   sudo fdisk -l
   ```

2. 管理指定磁盘

   ```bash
   sudo fdisk /dev/sdb
   ```

3. 查看特定磁盘分区表

   ```bash
   sudo fdisk -l /dev/sda
   ```

**相关命令：** `parted`、`gdisk`、`lsblk`、`mkfs`

**标签：** 分区、磁盘、管理、格式化、创建

---

**findfs**　`低危`

> 根据 UUID 或卷标（LABEL）查找对应的块设备文件路径（如 /dev/sda1）

**语法：**

```bash
findfs UUID=值 或 findfs LABEL=值
```

**常用参数：**
- `UUID=xxxx`：根据 UUID 查找设备
- `LABEL=name`：根据卷标查找设备
- `PARTUUID=xxxx`：根据分区 UUID 查找（GPT）
- `PARTLABEL=name`：根据分区标签查找（GPT）

**示例：**

1. 根据 UUID 查找设备路径

   ```bash
   sudo findfs UUID=a1b2c3d4-e5f6-7890-abcd-ef1234567890
   ```

2. 根据卷标查找设备路径

   ```bash
   sudo findfs LABEL=mydata
   ```

3. 在 fstab 自动挂载脚本中使用（动态获取设备名）

   ```bash
   sudo mount $(sudo findfs UUID=a1b2...890) /mnt/data
   ```

4. 先查 blkid 获取 UUID，再用 findfs 确认设备路径

   ```bash
   blkid /dev/sdb1
   sudo findfs UUID=<上面输出的 UUID>
   ```

5. 查找并挂载（一行脚本）

   ```bash
   sudo mount $(findfs UUID=a1b2...890) /mnt/backup
   ```

**相关命令：** `blkid`、`lsblk`、`mount`、`fstab`

**标签：** 查找、UUID、卷标、设备、磁盘、标识、搜索

---

**fsck**　`极高危`

> 检查和修复文件系统错误

**语法：**

```bash
fsck [选项] 设备
```

**常用参数：**
- `-A`：检查所有文件系统
- `-N`：干运行（不实际修复）
- `-y`：所有提示自动回答 yes

**示例：**

1. 检查文件系统（需先卸载）

   ```bash
   sudo fsck /dev/sdb1
   ```

2. 自动修复所有错误

   ```bash
   sudo fsck -y /dev/sdb1
   ```

3. 干运行查看问题但不修复

   ```bash
   sudo fsck -N /dev/sdb1
   ```

**相关命令：** `mount`、`umount`、`mkfs`、`badblocks`

**标签：** 检查、修复、文件系统、磁盘、错误

---

**fstab**　`极高危`

> 文件系统挂载表 /etc/fstab——定义系统启动时自动挂载哪些分区和设备的配置文件

**语法：**

```bash
/etc/fstab 配置文件，由 mount -a 或系统启动过程读取
```

**示例：**

1. 【查看】查看当前的 fstab 配置

   ```bash
   cat /etc/fstab
   ```

2. 【格式说明】fstab 每行 6 个字段：设备  挂载点  文件系统类型  选项  dump  fsck顺序

   ```bash
   UUID=a1b2... /mnt/data ext4 defaults 0 2
   ```

3. 【字段1】设备标识——推荐用 UUID（稳定），也可用 /dev/sdb1 或 LABEL=mydata

   ```bash
   lsblk -f   # 查看所有设备的 UUID 和文件系统类型
   ```

4. 【字段2】挂载点——分区挂载到的目录路径

   ```bash
   sudo mkdir -p /mnt/data   # 先创建挂载点目录
   ```

5. 【字段3】文件系统类型——ext4 / xfs / ntfs / vfat / swap 等

   ```bash
   lsblk -f   # 查看设备的文件系统类型
   ```

6. 【字段4】挂载选项——defaults（默认）/ noatime（不更新访问时间）/ ro（只读）/ noexec（禁止执行）

   ```bash
   defaults,noatime   # 常用组合
   ```

7. 【字段5】dump 备份开关——0 禁用 / 1 启用（一般设 0）

   ```bash
   0
   ```

8. 【字段6】fsck 检查顺序——0 不检查 / 1 根分区 / 2 其他分区（一般根分区设 1，其余设 2 或 0）

   ```bash
   根分区用 1，其他 ext4 分区用 2，swap/NTFS 用 0
   ```

9. 【实战】添加一个 ext4 分区自动挂载

   ```bash
   # 1. 获取 UUID
   sudo blkid /dev/sdb1
   # 输出: /dev/sdb1: UUID="abc123..." TYPE="ext4"
   # 2. 创建挂载点
   sudo mkdir -p /mnt/data
   # 3. 编辑 fstab（用 vi/vim 或 nano）
   sudo vim /etc/fstab
   # 添加一行：
   UUID=abc123 /mnt/data ext4 defaults 0 2
   ```

10. 【实战】添加 NTFS 移动硬盘自动挂载（只读）

   ```bash
   UUID=xyz789 /mnt/windows ntfs defaults,ro,uid=1000,gid=1000 0 0
   ```

11. 【实战】添加 swap 分区

   ```bash
   UUID=swap-uuid none swap sw 0 0
   ```

12. 【实战】添加 tmpfs 内存文件系统

   ```bash
   tmpfs /mnt/ramdisk tmpfs defaults,size=2G 0 0
   ```

13. 【验证】修改 fstab 后务必测试——不重启验证配置是否正确

   ```bash
   sudo mount -a   # 尝试挂载 fstab 中所有未挂载的条目
   ```

14. 【验证】检查当前挂载是否与 fstab 一致

   ```bash
   findmnt --verify   # 检查 fstab 语法和挂载状态
   ```

15. 【排错】如果 fstab 配置错误导致系统无法启动

   ```bash
   # 启动时进入 recovery mode，或从 Live USB 启动，然后：
   sudo mount /dev/sda1 /mnt
   sudo vim /mnt/etc/fstab   # 修复错误行
   sudo reboot
   ```

**相关命令：** `mount`、`umount`、`blkid`、`findfs`、`lsblk`、`systemd.mount`

**标签：** 挂载、自动、启动、配置文件、磁盘、分区、开机、永久、fstab

---

**mkfs**　`极高危`

> 创建文件系统（格式化分区）

**语法：**

```bash
mkfs.[类型] [选项] 设备
```

**常用参数：**
- `-t`：指定文件系统类型
- `-L`：设置卷标

**示例：**

1. 格式化为 ext4

   ```bash
   sudo mkfs.ext4 /dev/sdb1
   ```

2. 创建并设置卷标

   ```bash
   sudo mkfs.ext4 -L mydata /dev/sdb1
   ```

**相关命令：** `fdisk`、`parted`、`fsck`、`mount`

**标签：** 格式化、文件系统、创建、分区、ext4、磁盘

---

**mount**　`高危`

> 挂载文件系统

**语法：**

```bash
mount [选项] 设备 挂载点
```

**常用参数：**
- `-t`：指定文件系统类型
- `-o`：指定挂载选项

**示例：**

1. 挂载分区到指定目录

   ```bash
   sudo mount /dev/sdb1 /mnt/data
   ```

2. 挂载 ISO 镜像

   ```bash
   sudo mount -o loop file.iso /mnt/iso
   ```

3. 以只读方式挂载

   ```bash
   sudo mount -o ro /dev/sdb1 /mnt/readonly
   ```

4. 查看已挂载的文件系统

   ```bash
   mount | column -t
   ```

**相关命令：** `umount`、`findmnt`、`lsblk`、`fstab`

**标签：** 挂载、文件系统、磁盘、分区、USB、ISO

---

**parted**　`极高危`

> 磁盘分区管理工具（GPT/MBR）

**语法：**

```bash
parted [选项] 设备
```

**常用参数：**
- `-l`：列出所有块设备的分区表

**示例：**

1. 列出所有分区

   ```bash
   sudo parted -l
   ```

2. 进入交互式分区管理

   ```bash
   sudo parted /dev/sdb
   ```

3. 创建 GPT 分区表

   ```bash
   sudo parted /dev/sdb mklabel gpt
   ```

**相关命令：** `fdisk`、`gdisk`、`mkfs`、`lsblk`

**标签：** 分区、磁盘、GPT、MBR、管理

---

**swapon**　`高危`

> 启用交换空间

**语法：**

```bash
swapon [选项] [设备]
```

**常用参数：**
- `-s`：显示交换使用摘要
- `-a`：启用所有 swap

**示例：**

1. 查看交换空间使用

   ```bash
   swapon --show
   ```

2. 启用 swap 分区

   ```bash
   sudo swapon /dev/sdb2
   ```

3. 创建并启用 swap 文件

   ```bash
   sudo fallocate -l 2G /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
   ```

**相关命令：** `swapoff`、`free`、`mkswap`、`vmstat`

**标签：** 交换、swap、内存、虚拟内存、启用

---

**sync**　`低危`

> 将缓存中的数据强制写入磁盘

**语法：**

```bash
sync
```

**示例：**

1. 同步所有缓存到磁盘

   ```bash
   sync
   ```

2. 安全弹出 USB 前执行

   ```bash
   sync && sudo umount /mnt/usb
   ```

**相关命令：** `fsync`、`dd`

**标签：** 同步、写入、缓存、磁盘、保存、刷新

---

**umount**　`高危`

> 卸载已挂载的文件系统

**语法：**

```bash
umount [选项] 挂载点|设备
```

**常用参数：**
- `-f`：强制卸载
- `-l`：延迟卸载（lazy unmount）

**示例：**

1. 卸载文件系统

   ```bash
   sudo umount /mnt/data
   ```

2. 强制卸载

   ```bash
   sudo umount -f /mnt/stuck
   ```

3. 延迟卸载（安全退出繁忙设备）

   ```bash
   sudo umount -l /mnt/busy
   ```

**相关命令：** `mount`、`findmnt`、`fuser`

**标签：** 卸载、取消、挂载、文件系统、弹出

---

#### 文件操作

**bunzip2**　`低危`

> 解压 bzip2 压缩的文件（等同 bzip2 -d）

**语法：**

```bash
bunzip2 [选项] 文件.bz2
```

**常用参数：**
- `-k`：保留压缩文件
- `-v`：显示详细信息

**示例：**

1. 解压文件

   ```bash
   bunzip2 file.txt.bz2
   ```

2. 解压并保留原文件

   ```bash
   bunzip2 -k file.txt.bz2
   ```

**相关命令：** `bzip2`、`gunzip`、`xz`

**标签：** 解压、文件、bzip2

---

**bzip2**　`低危`

> 使用 bzip2 算法压缩文件（压缩比高于 gzip）

**语法：**

```bash
bzip2 [选项] 文件...
```

**常用参数：**
- `-d`：解压
- `-k`：保留原始文件
- `-v`：显示压缩信息

**示例：**

1. 压缩文件

   ```bash
   bzip2 file.txt
   ```

2. 解压文件

   ```bash
   bzip2 -d file.txt.bz2
   ```

3. 压缩并保留原文件

   ```bash
   bzip2 -k file.txt
   ```

**相关命令：** `bunzip2`、`gzip`、`xz`、`tar`

**标签：** 压缩、文件、bzip2

---

**cat**　`低危`

> 连接文件并输出到标准输出

**语法：**

```bash
cat [选项] [文件...]
```

**常用参数：**
- `-n`：显示行号
- `-b`：仅对非空行显示行号
- `-s`：压缩连续的空行为一行

**示例：**

1. 查看文件内容

   ```bash
   cat file.txt
   ```

2. 带行号查看

   ```bash
   cat -n file.txt
   ```

3. 合并多个文件

   ```bash
   cat file1.txt file2.txt > merged.txt
   ```

4. 将内容追加到文件

   ```bash
   cat file1.txt >> file2.txt
   ```

**相关命令：** `less`、`more`、`head`、`tail`、`tac`、`bat`

**标签：** 查看、显示、文件、内容、输出、连接

---

**cd**　`低危`

> 切换工作目录

**语法：**

```bash
cd [目录路径]
```

**示例：**

1. 进入指定目录

   ```bash
   cd /home/user/projects
   ```

2. 返回上级目录

   ```bash
   cd ..
   ```

3. 返回上一次所在的目录

   ```bash
   cd -
   ```

4. 回到用户主目录

   ```bash
   cd ~
   ```

5. 回到用户主目录

   ```bash
   cd
   ```

**相关命令：** `pwd`、`ls`、`pushd`、`popd`

**标签：** 切换、目录、进入、跳转、文件夹、路径

---

**cp**　`中危`

> 复制文件或目录

**语法：**

```bash
cp [选项] 源文件 目标文件
```

**常用参数：**
- `-r`：递归复制整个目录
- `-i`：覆盖前询问确认
- `-v`：显示复制过程
- `-u`：仅复制更新的文件（目标更旧或不存在）
- `-p`：保留文件属性（权限、时间戳）
- `-a`：归档模式，保留所有属性和链接

**示例：**

1. 复制文件

   ```bash
   cp file.txt file_backup.txt
   ```

2. 复制目录（递归）

   ```bash
   cp -r /src/dir /dest/dir
   ```

3. 复制前询问确认

   ```bash
   cp -i source.txt dest.txt
   ```

4. 保留属性的归档复制

   ```bash
   cp -a /home/user /backup/user
   ```

**相关命令：** `mv`、`rsync`、`scp`、`dd`

**标签：** 复制、拷贝、文件、目录、备份

---

**df**　`低危`

> 查看文件系统磁盘空间使用情况

**语法：**

```bash
df [选项] [路径]
```

**常用参数：**
- `-h`：人类可读格式
- `-T`：显示文件系统类型
- `-i`：显示 inode 使用情况

**示例：**

1. 查看所有分区的磁盘使用

   ```bash
   df -h
   ```

2. 查看特定目录所在分区

   ```bash
   df -h /home
   ```

3. 显示文件系统类型

   ```bash
   df -Th
   ```

**相关命令：** `du`、`mount`、`lsblk`

**标签：** 磁盘、空间、剩余、查看、分区、挂载

---

**du**　`低危`

> 查看目录或文件的磁盘使用量

**语法：**

```bash
du [选项] [路径]
```

**常用参数：**
- `-h`：人类可读格式（KB, MB, GB）
- `-s`：仅显示总计
- `-d`：指定递归深度
- `--max-depth`：最大深度

**示例：**

1. 查看当前目录各子目录大小

   ```bash
   du -h --max-depth=1
   ```

2. 查看指定目录总大小

   ```bash
   du -sh /home/user
   ```

3. 按大小排序显示最大的目录

   ```bash
   du -h --max-depth=1 | sort -hr
   ```

**相关命令：** `df`、`ncdu`、`ls`

**标签：** 磁盘、大小、空间、使用、目录、占用

---

**file**　`低危`

> 检测文件类型

**语法：**

```bash
file [选项] 文件...
```

**常用参数：**
- `-i`：输出 MIME 类型
- `-z`：尝试查看压缩文件内部

**示例：**

1. 检测文件类型

   ```bash
   file unknown.bin
   ```

2. 输出 MIME 类型

   ```bash
   file -i document.pdf
   ```

**相关命令：** `stat`、`ls`、`mimetype`

**标签：** 类型、文件、检测、识别、查看、格式

---

**find**　`低危`

> 在目录层次结构中搜索文件

**语法：**

```bash
find [路径] [表达式]
```

**常用参数：**
- `-name`：按文件名模式匹配
- `-type`：按文件类型筛选（f=文件, d=目录, l=符号链接）
- `-size`：按文件大小筛选
- `-mtime`：按修改时间筛选（天数）
- `-exec`：对匹配文件执行命令
- `-delete`：删除匹配的文件

**示例：**

1. 按文件名查找

   ```bash
   find /home -name "*.txt"
   ```

2. 查找并删除临时文件

   ```bash
   find . -name "*.tmp" -delete
   ```

3. 查找大于 100MB 的文件

   ```bash
   find / -type f -size +100M
   ```

4. 查找最近 7 天修改的文件

   ```bash
   find . -mtime -7
   ```

5. 查找并执行命令

   ```bash
   find . -name "*.log" -exec gzip {} \;
   ```

**相关命令：** `locate`、`grep`、`xargs`、`fd`

**标签：** 搜索、查找、文件、目录、递归、搜索文件

---

**gzip**　`低危`

> 使用 GNU zip 压缩文件

**语法：**

```bash
gzip [选项] 文件...
```

**常用参数：**
- `-d`：解压（等同 gunzip）
- `-k`：保留原始文件
- `-v`：显示压缩信息
- `-r`：递归压缩目录中所有文件

**示例：**

1. 压缩文件

   ```bash
   gzip file.txt
   ```

2. 解压文件

   ```bash
   gzip -d file.txt.gz
   ```

3. 压缩但保留原文件

   ```bash
   gzip -k file.txt
   ```

**相关命令：** `gunzip`、`tar`、`bzip2`、`xz`

**标签：** 压缩、文件、gzip

---

**head**　`低危`

> 输出文件开头的若干行

**语法：**

```bash
head [选项] [文件...]
```

**常用参数：**
- `-n`：指定输出的行数（默认 10）
- `-c`：输出前 N 个字节

**示例：**

1. 查看文件前 10 行

   ```bash
   head file.txt
   ```

2. 查看文件前 20 行

   ```bash
   head -n 20 file.txt
   ```

3. 查看文件前 100 个字节

   ```bash
   head -c 100 file.txt
   ```

**相关命令：** `tail`、`less`、`cat`、`sed`

**标签：** 查看、开头、前几行、文件、头部

---

**less**　`低危`

> 分页查看文件内容（支持前后翻页）

**语法：**

```bash
less [选项] 文件
```

**常用参数：**
- `-N`：显示行号
- `-i`：搜索时忽略大小写
- `-S`：不换行（横向滚动）

**示例：**

1. 分页查看大文件

   ```bash
   less large_file.log
   ```

2. 带行号查看

   ```bash
   less -N file.txt
   ```

3. 查看时搜索关键词（输入 /keyword）

   ```bash
   less file.txt
   ```

**相关命令：** `more`、`cat`、`head`、`tail`

**标签：** 查看、浏览、翻页、文件、内容、分页、阅读

---

**ln**　`低危`

> 创建文件链接（硬链接或符号链接）

**语法：**

```bash
ln [选项] 目标 链接名
```

**常用参数：**
- `-s`：创建符号链接（软链接）
- `-f`：强制覆盖已存在的目标文件
- `-v`：显示创建过程

**示例：**

1. 创建符号链接

   ```bash
   ln -s /path/to/original link_name
   ```

2. 创建硬链接

   ```bash
   ln original.txt hardlink.txt
   ```

3. 强制覆盖创建软链接

   ```bash
   ln -sf /new/target link_name
   ```

**相关命令：** `unlink`、`readlink`、`realpath`

**标签：** 链接、快捷方式、符号、硬链接、软链接

---

**locate**　`低危`

> 通过索引数据库快速查找文件路径

**语法：**

```bash
locate [选项] 模式
```

**常用参数：**
- `-i`：忽略大小写
- `-c`：只显示匹配数量
- `-l`：限制输出数量

**示例：**

1. 快速查找文件

   ```bash
   locate nginx.conf
   ```

2. 忽略大小写查找

   ```bash
   locate -i README
   ```

3. 限制结果数量

   ```bash
   locate -l 10 *.pdf
   ```

**相关命令：** `find`、`updatedb`、`mlocate`、`which`

**标签：** 搜索、查找、文件、快速、索引、路径

---

**ls**　`低危`

> 列出目录内容

**语法：**

```bash
ls [选项] [路径]
```

**常用参数：**
- `-l`：长格式显示，包含权限、大小、时间
- `-a`：显示所有文件，包括隐藏文件
- `-h`：以人类可读的大小格式显示
- `-t`：按修改时间排序
- `-r`：反向排序
- `-R`：递归列出子目录

**示例：**

1. 列出当前目录内容（详细格式）

   ```bash
   ls -l
   ```

2. 列出所有文件（含隐藏文件），人类可读大小

   ```bash
   ls -lah
   ```

3. 按时间排序，最新的在最前

   ```bash
   ls -lt
   ```

4. 递归显示所有子目录

   ```bash
   ls -R /home/user
   ```

**相关命令：** `tree`、`stat`、`dir`、`find`

**标签：** 列出、查看、目录、文件、列表、显示、文件夹

---

**md5sum**　`低危`

> 计算文件的 MD5 校验值

**语法：**

```bash
md5sum [选项] 文件...
```

**常用参数：**
- `-c`：从文件读取并验证校验和

**示例：**

1. 计算 MD5 值

   ```bash
   md5sum file.iso
   ```

2. 批量校验文件

   ```bash
   md5sum -c checksums.md5
   ```

**相关命令：** `sha256sum`、`sha1sum`、`cksum`

**标签：** 校验、MD5、哈希、完整性、验证、文件

---

**mkdir**　`低危`

> 创建目录

**语法：**

```bash
mkdir [选项] 目录...
```

**常用参数：**
- `-p`：递归创建父目录（不存在时自动创建）
- `-m`：设置目录权限模式
- `-v`：显示创建过程

**示例：**

1. 创建目录

   ```bash
   mkdir new_dir
   ```

2. 递归创建多级目录（一步到位）

   ```bash
   mkdir -p /path/to/deep/directory
   ```

3. 创建并设置权限

   ```bash
   mkdir -m 755 public_dir
   ```

**相关命令：** `rmdir`、`touch`、`ls`

**标签：** 创建、目录、文件夹、新建

---

**mv**　`中危`

> 移动或重命名文件/目录

**语法：**

```bash
mv [选项] 源 目标
```

**常用参数：**
- `-i`：覆盖前询问确认
- `-v`：显示移动过程
- `-u`：仅当源文件较新或目标不存在时移动
- `-n`：不覆盖已有文件

**示例：**

1. 重命名文件

   ```bash
   mv oldname.txt newname.txt
   ```

2. 移动文件到目录

   ```bash
   mv file.txt /target/directory/
   ```

3. 移动并询问覆盖确认

   ```bash
   mv -i source.txt dest.txt
   ```

**相关命令：** `cp`、`rename`、`mmv`

**标签：** 移动、重命名、改名、文件、目录、剪切

---

**popd**　`低危`

> 从目录栈弹出并切换到该目录

**语法：**

```bash
popd
```

**示例：**

1. 返回上一个目录

   ```bash
   popd
   ```

2. 查看目录栈

   ```bash
   dirs -v
   ```

**相关命令：** `pushd`、`dirs`、`cd`

**标签：** 目录、返回、切换、栈

---

**pushd**　`低危`

> 切换目录并将当前目录压入目录栈

**语法：**

```bash
pushd [目录]
```

**示例：**

1. 跳转并压栈

   ```bash
   pushd /var/log
   ```

2. 交换栈顶两个目录

   ```bash
   pushd
   ```

3. 查看目录栈

   ```bash
   dirs -v
   ```

**相关命令：** `popd`、`dirs`、`cd`

**标签：** 目录、切换、栈、返回、导航

---

**pwd**　`低危`

> 显示当前工作目录的绝对路径

**语法：**

```bash
pwd [选项]
```

**常用参数：**
- `-P`：显示物理路径，解析所有符号链接
- `-L`：显示逻辑路径（默认）

**示例：**

1. 显示当前工作目录

   ```bash
   pwd
   ```

2. 显示当前真实物理路径

   ```bash
   pwd -P
   ```

**相关命令：** `cd`、`ls`、`realpath`

**标签：** 当前、目录、路径、所在、位置、查看

---

**rm**　`极高危`

> 删除文件或目录

**语法：**

```bash
rm [选项] 文件...
```

**常用参数：**
- `-r`：递归删除目录及其内容
- `-f`：强制删除，不提示确认
- `-i`：删除每个文件前询问确认
- `-v`：显示删除过程

**示例：**

1. 删除文件

   ```bash
   rm file.txt
   ```

2. 强制递归删除目录（危险！）

   ```bash
   rm -rf /path/to/directory
   ```

3. 删除前逐个确认

   ```bash
   rm -i *.log
   ```

4. 删除所有 .tmp 文件

   ```bash
   rm *.tmp
   ```

**相关命令：** `rmdir`、`unlink`、`shred`、`find`

**标签：** 删除、移除、清除、文件、目录、文件夹

---

**rmdir**　`中危`

> 删除空目录

**语法：**

```bash
rmdir [选项] 目录...
```

**常用参数：**
- `-p`：递归删除路径中的空目录
- `--ignore-fail-on-non-empty`：忽略非空目录错误

**示例：**

1. 删除空目录

   ```bash
   rmdir empty_dir
   ```

2. 级联删除路径上所有空目录

   ```bash
   rmdir -p a/b/c
   ```

**相关命令：** `rm`、`mkdir`

**标签：** 删除、目录、空、移除、文件夹

---

**shred**　`极高危`

> 安全地覆盖并删除文件（防止恢复）

**语法：**

```bash
shred [选项] 文件...
```

**常用参数：**
- `-n`：覆盖次数（默认 3）
- `-u`：覆盖后删除文件
- `-z`：最后用零覆盖以隐藏痕迹

**示例：**

1. 安全删除文件

   ```bash
   shred -u secret.txt
   ```

2. 多次覆盖后删除

   ```bash
   shred -n 7 -uz sensitive_data.txt
   ```

**相关命令：** `rm`、`wipe`、`dd`

**标签：** 删除、安全、粉碎、覆盖、清除、隐私

---

**split**　`中危`

> 将大文件分割成多个小文件

**语法：**

```bash
split [选项] 文件 [前缀]
```

**常用参数：**
- `-b`：按字节数分割（如 100M）
- `-l`：按行数分割
- `-d`：使用数字后缀

**示例：**

1. 按 100MB 分割文件

   ```bash
   split -b 100M large_file.tar.gz part_
   ```

2. 按 1000 行分割

   ```bash
   split -l 1000 data.csv row_
   ```

3. 合并回去

   ```bash
   cat part_* > restored.tar.gz
   ```

**相关命令：** `cat`、`csplit`、`join`

**标签：** 分割、拆分、文件、大文件、切割

---

**stat**　`低危`

> 显示文件或文件系统的详细信息

**语法：**

```bash
stat [选项] 文件...
```

**常用参数：**
- `-c`：自定义输出格式

**示例：**

1. 查看文件详细信息

   ```bash
   stat file.txt
   ```

2. 只显示文件大小

   ```bash
   stat -c %s file.txt
   ```

**相关命令：** `ls`、`file`、`df`

**标签：** 信息、文件、大小、时间、权限、inode、查看

---

**tail**　`低危`

> 输出文件末尾的若干行

**语法：**

```bash
tail [选项] [文件...]
```

**常用参数：**
- `-n`：指定输出的行数（默认 10）
- `-f`：实时跟踪文件新增内容
- `-F`：同 -f 但文件被删除重建后继续跟踪

**示例：**

1. 查看文件最后 10 行

   ```bash
   tail file.txt
   ```

2. 查看文件最后 50 行

   ```bash
   tail -n 50 file.txt
   ```

3. 实时查看日志

   ```bash
   tail -f /var/log/syslog
   ```

**相关命令：** `head`、`less`、`cat`

**标签：** 查看、末尾、尾部、最后、文件、跟踪、实时

---

**tar**　`中危`

> 打包/解包归档文件

**语法：**

```bash
tar [选项] [文件...]
```

**常用参数：**
- `-c`：创建归档
- `-x`：解压归档
- `-v`：显示处理过程
- `-f`：指定归档文件名
- `-z`：使用 gzip 压缩/解压
- `-j`：使用 bzip2 压缩/解压
- `-t`：列出归档内容

**示例：**

1. 打包目录为 tar.gz

   ```bash
   tar -czvf archive.tar.gz /path/to/dir
   ```

2. 解压 tar.gz

   ```bash
   tar -xzvf archive.tar.gz
   ```

3. 解压到指定目录

   ```bash
   tar -xzvf archive.tar.gz -C /target/dir
   ```

4. 列出归档内容（不解压）

   ```bash
   tar -tzvf archive.tar.gz
   ```

5. 打包为 tar.bz2

   ```bash
   tar -cjvf archive.tar.bz2 /path/to/dir
   ```

**相关命令：** `gzip`、`zip`、`unzip`、`bzip2`、`xz`

**标签：** 打包、解压、压缩、归档、备份、解包

---

**touch**　`低危`

> 创建空文件或更新文件时间戳

**语法：**

```bash
touch [选项] 文件...
```

**常用参数：**
- `-a`：仅修改访问时间
- `-m`：仅修改修改时间
- `-t`：指定时间戳

**示例：**

1. 创建空文件

   ```bash
   touch newfile.txt
   ```

2. 批量创建多个文件

   ```bash
   touch file1.txt file2.txt file3.txt
   ```

3. 更新文件时间为当前时间

   ```bash
   touch existing_file.txt
   ```

**相关命令：** `mkdir`、`stat`

**标签：** 创建、文件、空、时间、时间戳、新建、更新

---

**tree**　`低危`

> 以树形结构列出目录内容

**语法：**

```bash
tree [选项] [目录]
```

**常用参数：**
- `-L`：限制显示深度
- `-d`：只显示目录
- `-a`：包含隐藏文件

**示例：**

1. 树形显示当前目录

   ```bash
   tree
   ```

2. 限制深度为 2 级

   ```bash
   tree -L 2
   ```

3. 只显示目录结构

   ```bash
   tree -d
   ```

**相关命令：** `ls`、`find`

**标签：** 目录、树、结构、显示、层级、查看

---

**unzip**　`低危`

> 解压 ZIP 归档

**语法：**

```bash
unzip [选项] 压缩包
```

**常用参数：**
- `-d`：指定解压目录
- `-l`：列出压缩包内容（不解压）

**示例：**

1. 解压 ZIP 文件

   ```bash
   unzip archive.zip
   ```

2. 解压到指定目录

   ```bash
   unzip archive.zip -d /target/dir
   ```

3. 列出压缩包内容

   ```bash
   unzip -l archive.zip
   ```

**相关命令：** `zip`、`tar`、`gunzip`

**标签：** 解压、zip、提取、归档

---

**xxd**　`低危`

> 以十六进制转储查看文件内容

**语法：**

```bash
xxd [选项] [文件]
```

**常用参数：**
- `-b`：以二进制位形式显示
- `-c`：每行显示的字节数，默认 16
- `-l`：只显示前 n 个字节
- `-r`：将十六进制转储还原为原始文件

**示例：**

1. 以十六进制查看文件内容

   ```bash
   xxd file.bin
   ```

2. 只查看文件前 128 字节

   ```bash
   xxd -l 128 file.bin
   ```

3. 将十六进制转储还原为二进制文件

   ```bash
   xxd -r dump.hex > restored.bin
   ```

**相关命令：** `cat`、`md5sum`

**标签：** 十六进制、hex、转储、查看、二进制、dump、字节

---

**xz**　`低危`

> 使用 LZMA 算法压缩文件（极高压缩比）

**语法：**

```bash
xz [选项] 文件...
```

**常用参数：**
- `-d`：解压
- `-k`：保留原始文件
- `-9`：最高压缩级别

**示例：**

1. 压缩文件

   ```bash
   xz file.txt
   ```

2. 解压文件

   ```bash
   xz -d file.txt.xz
   ```

3. 最高压缩比

   ```bash
   xz -9k large_file.log
   ```

**相关命令：** `unxz`、`gzip`、`bzip2`、`tar`

**标签：** 压缩、文件、xz、高压缩比

---

**zip**　`低危`

> 创建 ZIP 压缩归档

**语法：**

```bash
zip [选项] 压缩包名 文件...
```

**常用参数：**
- `-r`：递归压缩目录
- `-e`：加密压缩

**示例：**

1. 压缩目录

   ```bash
   zip -r archive.zip /path/to/dir
   ```

2. 加密压缩文件

   ```bash
   zip -e secret.zip file.txt
   ```

**相关命令：** `unzip`、`tar`、`gzip`、`7z`

**标签：** 压缩、打包、zip、归档

---

#### 网络相关

**curl**　`低危`

> 通过 URL 传输数据的命令行工具

**语法：**

```bash
curl [选项] URL
```

**常用参数：**
- `-o`：将输出保存到文件
- `-O`：使用远程文件名保存
- `-X`：指定请求方法（GET/POST/PUT/DELETE）
- `-H`：添加请求头
- `-d`：发送 POST 数据
- `-L`：跟随重定向
- `-I`：只获取响应头

**示例：**

1. 发送 GET 请求

   ```bash
   curl https://api.example.com
   ```

2. 下载文件

   ```bash
   curl -O https://example.com/file.zip
   ```

3. 发送 POST JSON 数据

   ```bash
   curl -X POST -H "Content-Type: application/json" -d '{"key":"value"}' https://api.example.com
   ```

4. 只显示响应头

   ```bash
   curl -I https://example.com
   ```

5. 跟随重定向下载

   ```bash
   curl -L -O https://example.com/redirect
   ```

**相关命令：** `wget`、`httpie`、`ping`

**标签：** 网络、下载、请求、HTTP、API、上传、接口

---

**dig**　`低危`

> DNS 诊断工具（比 nslookup 更详细）

**语法：**

```bash
dig [选项] 域名 [记录类型]
```

**常用参数：**
- `+short`：简洁输出
- `-t`：指定记录类型（A, MX, TXT 等）

**示例：**

1. 查询域名 A 记录

   ```bash
   dig google.com
   ```

2. 简洁输出

   ```bash
   dig +short google.com
   ```

3. 查询 MX 记录

   ```bash
   dig -t MX google.com
   ```

4. 查询所有记录

   ```bash
   dig -t ANY google.com
   ```

**相关命令：** `nslookup`、`host`、`whois`

**标签：** DNS、域名、查询、解析、诊断、记录

---

**ifconfig**　`中危`

> 配置和查看网络接口（已逐渐被 ip 替代）

**语法：**

```bash
ifconfig [接口] [选项]
```

**示例：**

1. 查看所有网络接口

   ```bash
   ifconfig
   ```

2. 查看指定接口

   ```bash
   ifconfig eth0
   ```

**相关命令：** `ip`、`iwconfig`、`ethtool`

**标签：** 网络、IP、接口、配置、网卡、查看

---

**ip**　`高危`

> 管理网络接口、路由、地址等

**语法：**

```bash
ip [选项] 对象 命令
```

**常用参数：**
- `addr`：管理 IP 地址
- `link`：管理网络接口
- `route`：管理路由表

**示例：**

1. 查看所有网络接口和 IP

   ```bash
   ip addr show
   ```

2. 查看路由表

   ```bash
   ip route show
   ```

3. 启用网络接口

   ```bash
   sudo ip link set eth0 up
   ```

**相关命令：** `ifconfig`、`route`、`netstat`、`iwconfig`

**标签：** 网络、IP、地址、接口、路由、配置、网卡

---

**iptables**　`极高危`

> 配置 Linux 网络防火墙规则

**语法：**

```bash
iptables [选项] [链] [规则]
```

**常用参数：**
- `-L`：列出所有规则
- `-A`：追加规则
- `-D`：删除规则
- `-F`：清空所有规则

**示例：**

1. 查看所有规则

   ```bash
   sudo iptables -L -n
   ```

2. 开放 80 端口

   ```bash
   sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
   ```

3. 阻止特定 IP

   ```bash
   sudo iptables -A INPUT -s 192.168.1.100 -j DROP
   ```

**相关命令：** `ufw`、`nftables`、`firewalld`

**标签：** 防火墙、网络、规则、安全、过滤、端口

---

**mtr**　`低危`

> 结合 ping 和 traceroute 的网络诊断工具

**语法：**

```bash
mtr [选项] 目标
```

**常用参数：**
- `-r`：报告模式（不交互）
- `-c`：发送 N 个探测包
- `-n`：不解析主机名

**示例：**

1. 交互式网络诊断

   ```bash
   mtr google.com
   ```

2. 报告模式输出

   ```bash
   mtr -r -c 10 google.com
   ```

3. 不解析主机名

   ```bash
   mtr -n 8.8.8.8
   ```

**相关命令：** `ping`、`traceroute`、`tracepath`

**标签：** 网络、诊断、路由、延迟、丢包、跟踪

---

**nc**　`中危`

> 网络工具中的瑞士军刀（TCP/UDP 读写）

**语法：**

```bash
nc [选项] 主机 端口
```

**常用参数：**
- `-l`：监听模式
- `-p`：指定本地端口
- `-v`：详细输出
- `-z`：端口扫描模式（不发送数据）

**示例：**

1. 测试端口是否开放

   ```bash
   nc -zv 192.168.1.1 80
   ```

2. 监听端口

   ```bash
   nc -l 8080
   ```

3. 简易聊天（服务端）

   ```bash
   nc -l 1234
   ```

4. 简易聊天（客户端）

   ```bash
   nc server_ip 1234
   ```

**相关命令：** `ncat`、`socat`、`telnet`、`nmap`

**标签：** 网络、端口、测试、监听、连接、TCP、UDP

---

**netstat**　`低危`

> 查看网络连接、路由表和网络接口统计

**语法：**

```bash
netstat [选项]
```

**常用参数：**
- `-t`：显示 TCP 连接
- `-u`：显示 UDP 连接
- `-l`：显示监听状态的端口
- `-n`：以数字形式显示地址和端口
- `-p`：显示进程信息

**示例：**

1. 查看所有监听端口

   ```bash
   netstat -tlnp
   ```

2. 查看所有连接

   ```bash
   netstat -tunap
   ```

3. 查看端口被哪个进程占用

   ```bash
   netstat -tlnp | grep :80
   ```

**相关命令：** `ss`、`lsof`、`nmap`、`iptables`

**标签：** 网络、连接、端口、查看、监听、统计

---

**nmap**　`高危`

> 网络扫描和安全审计工具

**语法：**

```bash
nmap [扫描类型] [选项] 目标
```

**常用参数：**
- `-sS`：SYN 半开扫描
- `-p`：指定端口范围
- `-sV`：探测服务版本
- `-O`：探测操作系统
- `-A`：全面扫描

**示例：**

1. 扫描常用端口

   ```bash
   nmap 192.168.1.1
   ```

2. 快速扫描指定端口

   ```bash
   nmap -p 22,80,443 192.168.1.1
   ```

3. 全面探测

   ```bash
   nmap -A 192.168.1.1
   ```

**相关命令：** `nc`、`netstat`、`masscan`

**标签：** 扫描、端口、安全、网络、探测、审计

---

**nslookup**　`低危`

> 查询 DNS 记录

**语法：**

```bash
nslookup [选项] 域名
```

**示例：**

1. 查询域名 IP 地址

   ```bash
   nslookup google.com
   ```

2. 使用指定 DNS 服务器查询

   ```bash
   nslookup google.com 8.8.8.8
   ```

**相关命令：** `dig`、`host`、`whois`

**标签：** DNS、域名、查询、解析、IP、记录

---

**ping**　`低危`

> 测试网络连通性（发送 ICMP 请求）

**语法：**

```bash
ping [选项] 目标
```

**常用参数：**
- `-c`：指定发包数量
- `-i`：指定发包间隔（秒）
- `-s`：指定数据包大小

**示例：**

1. 测试网络连通性

   ```bash
   ping google.com
   ```

2. 发送 4 个包后停止

   ```bash
   ping -c 4 192.168.1.1
   ```

3. 快速测试（0.2 秒间隔）

   ```bash
   ping -i 0.2 -c 10 8.8.8.8
   ```

**相关命令：** `traceroute`、`mtr`、`curl`、`nc`

**标签：** 网络、测试、连通、延迟、连接、网络测试

---

**rsync**　`中危`

> 高效的文件同步和传输工具

**语法：**

```bash
rsync [选项] 源 目标
```

**常用参数：**
- `-a`：归档模式（保留属性和权限）
- `-v`：显示详细信息
- `-z`：传输时压缩
- `--delete`：删除目标中源没有的文件
- `-P`：显示进度并支持断点续传

**示例：**

1. 本地同步目录

   ```bash
   rsync -av /source/ /dest/
   ```

2. 远程同步（压缩传输）

   ```bash
   rsync -avz /local/ user@server:/remote/
   ```

3. 镜像同步（删除多余文件）

   ```bash
   rsync -av --delete /src/ /dst/
   ```

4. 带进度条的传输

   ```bash
   rsync -avP large_file.iso user@server:/path/
   ```

**相关命令：** `scp`、`cp`、`tar`

**标签：** 同步、传输、备份、复制、镜像、增量

---

**scp**　`中危`

> 在本地和远程之间安全复制文件

**语法：**

```bash
scp [选项] 源 目标
```

**常用参数：**
- `-r`：递归复制整个目录
- `-P`：指定 SSH 端口
- `-q`：静默模式

**示例：**

1. 从本地复制到远程

   ```bash
   scp local.txt user@server:/path/
   ```

2. 从远程复制到本地

   ```bash
   scp user@server:/path/file.txt ./
   ```

3. 递归复制目录

   ```bash
   scp -r /local/dir user@server:/remote/dir
   ```

4. 使用指定端口复制

   ```bash
   scp -P 2222 file.txt user@server:/path/
   ```

**相关命令：** `rsync`、`ssh`、`sftp`

**标签：** 复制、传输、远程、文件、上传、下载、安全

---

**sftp**　`低危`

> SSH 文件传输协议（替代 FTP）

**语法：**

```bash
sftp [选项] 用户@主机
```

**常用参数：**
- `-P`：指定端口
- `-i`：指定密钥文件

**示例：**

1. 连接 SFTP 服务器

   ```bash
   sftp user@example.com
   ```

2. 下载文件（sftp 内）

   ```bash
   get remote_file.txt
   ```

3. 上传文件（sftp 内）

   ```bash
   put local_file.txt
   ```

**相关命令：** `scp`、`ssh`、`rsync`、`ftp`

**标签：** 文件、传输、安全、SSH、FTP、上传、下载

---

**ss**　`低危`

> 查看 socket 统计信息（比 netstat 更快）

**语法：**

```bash
ss [选项]
```

**常用参数：**
- `-t`：显示 TCP 连接
- `-u`：显示 UDP 连接
- `-l`：显示监听状态
- `-p`：显示进程信息
- `-n`：数字格式显示

**示例：**

1. 查看所有监听端口

   ```bash
   ss -tlnp
   ```

2. 查看所有 TCP 连接

   ```bash
   ss -tan
   ```

3. 查看占用 80 端口的进程

   ```bash
   ss -tlnp 'sport = :80'
   ```

**相关命令：** `netstat`、`lsof`、`nmap`

**标签：** 网络、连接、端口、socket、查看、监听

---

**ssh**　`中危`

> 安全远程登录到另一台主机

**语法：**

```bash
ssh [选项] 用户@主机
```

**常用参数：**
- `-p`：指定端口
- `-i`：指定私钥文件
- `-L`：本地端口转发
- `-R`：远程端口转发
- `-X`：启用 X11 转发

**示例：**

1. 远程登录服务器

   ```bash
   ssh user@192.168.1.100
   ```

2. 使用指定端口登录

   ```bash
   ssh -p 2222 user@example.com
   ```

3. 使用密钥登录

   ```bash
   ssh -i ~/.ssh/mykey user@example.com
   ```

4. 本地端口转发

   ```bash
   ssh -L 8080:localhost:80 user@server
   ```

**相关命令：** `scp`、`sftp`、`ssh-keygen`、`ssh-copy-id`、`mosh`

**标签：** 远程、登录、连接、服务器、安全、shell

---

**tcpdump**　`中危`

> 抓取和分析网络数据包

**语法：**

```bash
tcpdump [选项] [过滤表达式]
```

**常用参数：**
- `-i`：指定网络接口
- `-n`：不解析主机名
- `-c`：抓取 N 个包后停止
- `-w`：写入 pcap 文件
- `-r`：读取 pcap 文件

**示例：**

1. 抓取 80 端口流量

   ```bash
   sudo tcpdump -i eth0 port 80
   ```

2. 抓 100 个包保存到文件

   ```bash
   sudo tcpdump -c 100 -w capture.pcap
   ```

3. 读取抓包文件

   ```bash
   tcpdump -r capture.pcap
   ```

**相关命令：** `wireshark`、`tshark`、`ngrep`、`iptables`

**标签：** 抓包、网络、分析、数据包、诊断、流量

---

**traceroute**　`低危`

> 跟踪数据包到目标主机的路由路径

**语法：**

```bash
traceroute [选项] 目标
```

**常用参数：**
- `-n`：不解析主机名（更快）
- `-m`：指定最大跳数

**示例：**

1. 跟踪到目标的路由

   ```bash
   traceroute google.com
   ```

2. 不解析主机名

   ```bash
   traceroute -n 8.8.8.8
   ```

**相关命令：** `ping`、`mtr`、`tracepath`

**标签：** 网络、路由、跟踪、诊断、路径、跳数

---

**wget**　`低危`

> 从网络下载文件（支持递归和断点续传）

**语法：**

```bash
wget [选项] URL
```

**常用参数：**
- `-O`：指定输出文件名
- `-c`：断点续传
- `-r`：递归下载
- `-np`：不追溯父目录
- `--limit-rate`：限速下载

**示例：**

1. 下载文件

   ```bash
   wget https://example.com/file.tar.gz
   ```

2. 断点续传

   ```bash
   wget -c https://example.com/large_file.iso
   ```

3. 递归下载整个站点

   ```bash
   wget -r -np https://example.com/docs/
   ```

4. 限速 500KB/s 下载

   ```bash
   wget --limit-rate=500k https://example.com/file.iso
   ```

**相关命令：** `curl`、`axel`、`aria2`

**标签：** 下载、网络、文件、断点、递归

---

**whois**　`低危`

> 查询域名注册信息

**语法：**

```bash
whois 域名
```

**常用参数：**
- `-h`：指定 whois 服务器

**示例：**

1. 查询域名信息

   ```bash
   whois example.com
   ```

**相关命令：** `dig`、`nslookup`、`host`

**标签：** 域名、查询、注册、信息、whois

---

#### 其他常用

**alias**　`低危`

> 创建命令别名（快捷方式）

**语法：**

```bash
alias [别名='命令']
```

**示例：**

1. 创建别名

   ```bash
   alias ll='ls -lah'
   ```

2. 列出所有别名

   ```bash
   alias
   ```

3. 删除别名

   ```bash
   unalias ll
   ```

4. 创建常用别名

   ```bash
   alias gs='git status'
   ```

**相关命令：** `unalias`、`export`、`source`

**标签：** 别名、快捷、简化、缩写、自定义

---

**clear**　`低危`

> 清空终端屏幕

**语法：**

```bash
clear
```

**示例：**

1. 清空终端屏幕

   ```bash
   clear
   ```

2. 快捷键清屏

   ```bash
   Ctrl+L
   ```

**相关命令：** `reset`、`tput`

**标签：** 清屏、清理、屏幕、终端

---

**crontab**　`中危`

> 管理定时任务（cron jobs）

**语法：**

```bash
crontab [选项]
```

**常用参数：**
- `-e`：编辑当前用户的 crontab
- `-l`：列出当前用户的 crontab
- `-r`：删除当前用户的 crontab

**示例：**

1. 编辑定时任务

   ```bash
   crontab -e
   ```

2. 查看定时任务

   ```bash
   crontab -l
   ```

3. 每天凌晨 2 点执行备份（crontab 格式）

   ```bash
   0 2 * * * /scripts/backup.sh
   ```

**相关命令：** `cron`、`at`、`systemd.timer`、`anacron`

**标签：** 定时、计划、任务、自动化、周期、调度

---

**date**　`低危`

> 显示或设置系统日期和时间

**语法：**

```bash
date [选项] [+格式]
```

**常用参数：**
- `+%Y-%m-%d`：YYYY-MM-DD 格式
- `+%s`：Unix 时间戳

**示例：**

1. 显示当前日期时间

   ```bash
   date
   ```

2. 格式化输出

   ```bash
   date '+%Y-%m-%d %H:%M:%S'
   ```

3. 显示 Unix 时间戳

   ```bash
   date +%s
   ```

4. 显示 UTC 时间

   ```bash
   date -u
   ```

**相关命令：** `timedatectl`、`cal`、`hwclock`

**标签：** 日期、时间、显示、设置、格式

---

**echo**　`低危`

> 输出一行文本到标准输出

**语法：**

```bash
echo [选项] [字符串]
```

**常用参数：**
- `-n`：不输出末尾换行
- `-e`：启用转义字符（\n, \t 等）

**示例：**

1. 输出普通文本

   ```bash
   echo "Hello World"
   ```

2. 输出不换行

   ```bash
   echo -n "Loading..."
   ```

3. 使用转义字符

   ```bash
   echo -e "Line1\nLine2\nLine3"
   ```

4. 输出变量

   ```bash
   echo "Current user: $USER"
   ```

**相关命令：** `printf`、`cat`

**标签：** 输出、显示、打印、文本、字符串

---

**env**　`低危`

> 显示环境变量或以修改的环境执行命令

**语法：**

```bash
env [选项] [命令]
```

**常用参数：**
- `-i`：以空环境启动

**示例：**

1. 查看所有环境变量

   ```bash
   env
   ```

2. 查看特定变量

   ```bash
   env | grep PATH
   ```

3. 以修改的环境执行命令

   ```bash
   env VAR=value command
   ```

**相关命令：** `export`、`set`、`printenv`、`source`

**标签：** 环境、变量、查看、设置、配置

---

**export**　`低危`

> 设置环境变量或使其对子进程可见

**语法：**

```bash
export 变量=值
```

**常用参数：**
- `-p`：列出所有导出的变量

**示例：**

1. 设置环境变量

   ```bash
   export PATH=$PATH:/new/path
   ```

2. 查看所有导出变量

   ```bash
   export -p
   ```

3. 设置编辑器

   ```bash
   export EDITOR=vim
   ```

**相关命令：** `env`、`unset`、`source`

**标签：** 环境、变量、设置、导出、配置

---

**history**　`低危`

> 显示命令历史记录

**语法：**

```bash
history [选项]
```

**常用参数：**
- `-c`：清空历史记录

**示例：**

1. 查看历史命令

   ```bash
   history
   ```

2. 查看最近 20 条命令

   ```bash
   history 20
   ```

3. 使用 !! 执行上一条命令

   ```bash
   !!
   ```

4. 搜索历史再执行（Ctrl+R）

   ```bash
   (按 Ctrl+R 输入关键词)
   ```

**相关命令：** `fc`、`!!`

**标签：** 历史、记录、之前、命令、查看

---

**man**　`低危`

> 查看命令的手册页（帮助文档）

**语法：**

```bash
man [选项] 命令名
```

**常用参数：**
- `-k`：按关键词搜索手册页

**示例：**

1. 查看命令手册

   ```bash
   man ls
   ```

2. 搜索相关手册

   ```bash
   man -k partition
   ```

3. 查看指定章节

   ```bash
   man 5 crontab
   ```

**相关命令：** `tldr`、`info`、`whatis`、`help`、`--help`

**标签：** 帮助、文档、手册、查看、说明、参考

---

**printf**　`低危`

> 格式化输出文本（比 echo 更精确）

**语法：**

```bash
printf 格式 [参数...]
```

**示例：**

1. 格式化输出

   ```bash
   printf 'Hello, %s\n' "World"
   ```

2. 输出带前导零的数字

   ```bash
   printf '%03d\n' 7
   ```

3. 格式化为表格

   ```bash
   printf '%-10s %5d\n' Name Age
   ```

**相关命令：** `echo`、`awk`、`seq`

**标签：** 输出、格式化、打印、文本

---

**seq**　`低危`

> 生成数字序列

**语法：**

```bash
seq [选项] 结尾 | 开头 结尾 | 开头 步长 结尾
```

**常用参数：**
- `-s`：指定分隔符
- `-w`：等宽补零

**示例：**

1. 生成 1 到 10 的数字

   ```bash
   seq 1 10
   ```

2. 用逗号分隔

   ```bash
   seq -s ',' 1 5
   ```

3. 以步长 2 生成

   ```bash
   seq 0 2 10
   ```

**相关命令：** `echo`、`printf`、`for`

**标签：** 序列、数字、生成、循环

---

**sleep**　`低危`

> 暂停执行指定的时间

**语法：**

```bash
sleep 数字[单位]
```

**示例：**

1. 暂停 5 秒

   ```bash
   sleep 5
   ```

2. 暂停 1 分钟

   ```bash
   sleep 1m
   ```

3. 循环执行（每 10 秒检查一次）

   ```bash
   while true; do check_status; sleep 10; done
   ```

**相关命令：** `wait`、`watch`、`timeout`

**标签：** 等待、延迟、暂停、定时

---

**source**　`中危`

> 在当前 shell 环境中执行脚本

**语法：**

```bash
source 文件
```

**示例：**

1. 重新加载 bashrc

   ```bash
   source ~/.bashrc
   ```

2. 使用 . 简写

   ```bash
   . ~/.bashrc
   ```

3. 加载 Python 虚拟环境

   ```bash
   source venv/bin/activate
   ```

**相关命令：** `.`、`bash`、`export`

**标签：** 执行、加载、脚本、环境、配置、重载

---

**timeout**　`中危`

> 限制命令的执行时间（超时自动终止）

**语法：**

```bash
timeout [选项] 时间 命令
```

**常用参数：**
- `-s`：指定超时后发送的信号
- `-k`：发送 KILL 前的等待时间

**示例：**

1. 限制命令执行 5 秒

   ```bash
   timeout 5s ping google.com
   ```

2. 超时后强制终止

   ```bash
   timeout -s KILL 10s ./slow_script.sh
   ```

**相关命令：** `sleep`、`watch`、`time`

**标签：** 超时、限制、时间、终止、运行

---

**watch**　`低危`

> 周期性地执行命令并显示输出

**语法：**

```bash
watch [选项] 命令
```

**常用参数：**
- `-n`：指定刷新间隔（秒）
- `-d`：高亮显示变化部分

**示例：**

1. 每 2 秒查看磁盘使用

   ```bash
   watch -n 2 df -h
   ```

2. 高亮变化地监控进程

   ```bash
   watch -d 'ps aux | grep nginx'
   ```

3. 监控目录文件变化

   ```bash
   watch -n 1 'ls -l | wc -l'
   ```

**相关命令：** `crontab`、`while`、`top`

**标签：** 监控、周期、刷新、实时、重复

---

**which**　`低危`

> 查找命令的可执行文件路径

**语法：**

```bash
which 命令名
```

**示例：**

1. 查找 python 的位置

   ```bash
   which python3
   ```

2. 显示所有匹配的路径

   ```bash
   which -a python
   ```

**相关命令：** `whereis`、`type`、`locate`、`command -v`

**标签：** 查找、路径、命令、位置、可执行

---

**xargs**　`中危`

> 将标准输入转成命令参数并执行

**语法：**

```bash
xargs [选项] [命令]
```

**常用参数：**
- `-I`：指定替换字符串
- `-n`：每次执行使用 N 个参数
- `-P`：并行执行
- `-0`：以 null 字符分隔输入

**示例：**

1. 批量删除 .tmp 文件

   ```bash
   find . -name "*.tmp" | xargs rm
   ```

2. 处理带空格的文件名

   ```bash
   find . -name "*.log" -print0 | xargs -0 gzip
   ```

3. 批量重命名

   ```bash
   ls *.jpg | xargs -I {} mv {} backup_{}
   ```

4. 并行压缩（4 进程）

   ```bash
   find . -name "*.log" | xargs -P 4 gzip
   ```

**相关命令：** `find`、`parallel`、`exec`

**标签：** 参数、批量、执行、管道、转换

---

#### 包管理

**apt**　`中危`

> Debian/Ubuntu 系统的包管理工具

**语法：**

```bash
apt [命令] [包名]
```

**常用参数：**
- `update`：刷新软件包索引
- `upgrade`：升级所有已安装的包
- `install`：安装软件包
- `remove`：删除软件包
- `search`：搜索软件包
- `autoremove`：自动删除不再需要的依赖

**示例：**

1. 更新软件包索引

   ```bash
   sudo apt update
   ```

2. 安装软件包

   ```bash
   sudo apt install nginx
   ```

3. 搜索软件包

   ```bash
   apt search python3
   ```

4. 删除软件包

   ```bash
   sudo apt remove nginx
   ```

5. 清理无用依赖

   ```bash
   sudo apt autoremove
   ```

**相关命令：** `apt-get`、`dpkg`、`snap`、`flatpak`

**标签：** 安装、更新、包、软件、Ubuntu、Debian、源

---

**dnf**　`中危`

> Fedora/RHEL 的新一代包管理工具（替代 yum）

**语法：**

```bash
dnf [命令] [包名]
```

**常用参数：**
- `install`：安装软件包
- `update`：更新软件包
- `remove`：删除软件包
- `search`：搜索软件包

**示例：**

1. 安装软件包

   ```bash
   sudo dnf install nginx
   ```

2. 搜索软件包

   ```bash
   dnf search golang
   ```

3. 系统升级

   ```bash
   sudo dnf upgrade
   ```

**相关命令：** `yum`、`rpm`、`apt`

**标签：** 安装、更新、包、软件、Fedora、RHEL

---

**dpkg**　`高危`

> Debian 低级包管理工具

**语法：**

```bash
dpkg [选项] [.deb 包文件]
```

**常用参数：**
- `-i`：安装 deb 包
- `-r`：移除软件包
- `-l`：列出已安装的包

**示例：**

1. 安装 deb 包

   ```bash
   sudo dpkg -i package.deb
   ```

2. 列出已安装的包

   ```bash
   dpkg -l | grep nginx
   ```

3. 移除软件包

   ```bash
   sudo dpkg -r package_name
   ```

**相关命令：** `apt`、`apt-get`、`rpm`

**标签：** 包、deb、安装、Debian、Ubuntu

---

**flatpak**　`中危`

> 跨发行版的通用 Linux 应用分发系统

**语法：**

```bash
flatpak [命令] [参数]
```

**常用参数：**
- `install`：安装应用
- `remove`：卸载应用
- `list`：列出已安装的应用
- `search`：搜索应用
- `update`：更新所有应用

**示例：**

1. 搜索应用

   ```bash
   flatpak search firefox
   ```

2. 安装应用

   ```bash
   flatpak install flathub org.mozilla.firefox
   ```

3. 列出已安装应用

   ```bash
   flatpak list
   ```

**相关命令：** `snap`、`appimage`、`apt`、`dnf`

**标签：** 包、安装、通用、沙箱、Linux

---

**npm**　`中危`

> Node.js 包管理器

**语法：**

```bash
npm [命令] [包名]
```

**常用参数：**
- `install`：安装依赖
- `-g`：全局安装
- `uninstall`：卸载包
- `init`：初始化项目

**示例：**

1. 初始化项目

   ```bash
   npm init -y
   ```

2. 安装包

   ```bash
   npm install lodash
   ```

3. 全局安装工具

   ```bash
   npm install -g typescript
   ```

4. 运行脚本

   ```bash
   npm run build
   ```

**相关命令：** `yarn`、`pnpm`、`npx`、`node`

**标签：** Node.js、包、安装、npm、JavaScript、模块

---

**pacman**　`高危`

> Arch Linux 的包管理工具

**语法：**

```bash
pacman [操作] [选项] [包名]
```

**常用参数：**
- `-S`：同步（安装/搜索/更新）
- `-R`：删除软件包
- `-Q`：查询本地数据库
- `-Syu`：完整系统更新

**示例：**

1. 安装软件包

   ```bash
   sudo pacman -S firefox
   ```

2. 完全系统更新

   ```bash
   sudo pacman -Syu
   ```

3. 搜索软件包

   ```bash
   pacman -Ss python
   ```

4. 删除软件包及孤立依赖

   ```bash
   sudo pacman -Rns package_name
   ```

**相关命令：** `yay`、`paru`、`pamac`、`makepkg`

**标签：** 安装、更新、包、软件、Arch、Manjaro

---

**pip**　`中危`

> Python 包管理器

**语法：**

```bash
pip [命令] [包名]
```

**常用参数：**
- `install`：安装包
- `uninstall`：卸载包
- `list`：列出已安装的包
- `freeze`：以 requirements.txt 格式输出

**示例：**

1. 安装 Python 包

   ```bash
   pip install requests
   ```

2. 卸载包

   ```bash
   pip uninstall requests
   ```

3. 导出依赖到文件

   ```bash
   pip freeze > requirements.txt
   ```

**相关命令：** `pip3`、`npm`、`conda`、`virtualenv`

**标签：** Python、包、安装、pip、模块

---

**rpm**　`高危`

> Red Hat 低级包管理工具

**语法：**

```bash
rpm [选项] [.rpm 包文件]
```

**常用参数：**
- `-i`：安装 rpm 包
- `-e`：卸载软件包
- `-q`：查询已安装的包

**示例：**

1. 安装 rpm 包

   ```bash
   sudo rpm -i package.rpm
   ```

2. 查询已安装的包

   ```bash
   rpm -qa | grep nginx
   ```

3. 卸载软件包

   ```bash
   sudo rpm -e package_name
   ```

**相关命令：** `yum`、`dnf`、`dpkg`

**标签：** 包、rpm、安装、RedHat、CentOS、Fedora

---

**snap**　`中危`

> Ubuntu 的通用包管理系统

**语法：**

```bash
snap [命令] [包名]
```

**常用参数：**
- `install`：安装 snap 包
- `remove`：移除 snap 包
- `list`：列出已安装的 snap 包
- `find`：搜索 snap 包

**示例：**

1. 搜索软件包

   ```bash
   snap find vscode
   ```

2. 安装软件包

   ```bash
   sudo snap install vscode
   ```

3. 列出已安装的包

   ```bash
   snap list
   ```

**相关命令：** `apt`、`flatpak`、`appimage`

**标签：** 包、安装、软件、Ubuntu、snap、通用

---

**yum**　`中危`

> RHEL/CentOS 系统的包管理工具

**语法：**

```bash
yum [命令] [包名]
```

**常用参数：**
- `install`：安装软件包
- `update`：更新软件包
- `remove`：删除软件包
- `search`：搜索软件包
- `info`：查看软件包信息

**示例：**

1. 安装软件包

   ```bash
   sudo yum install httpd
   ```

2. 搜索软件包

   ```bash
   yum search python3
   ```

3. 更新所有软件包

   ```bash
   sudo yum update
   ```

**相关命令：** `dnf`、`rpm`、`apt`

**标签：** 安装、更新、包、软件、CentOS、RHEL、RedHat

---

#### 进程管理

**bg**　`低危`

> 将暂停的作业放到后台继续运行

**语法：**

```bash
bg [作业号]
```

**示例：**

1. 将最后一个暂停的任务放入后台

   ```bash
   bg
   ```

2. 将指定作业号的任务放入后台

   ```bash
   bg %1
   ```

**相关命令：** `fg`、`jobs`、`nohup`、`&`

**标签：** 后台、恢复、继续、运行、作业

---

**chroot**　`高危`

> 切换根目录并执行命令（创建隔离环境）

**语法：**

```bash
chroot [选项] 新根目录 [命令]
```

**常用参数：**
- `--userspec`：指定用户和组

**示例：**

1. 切换根目录并进入 shell

   ```bash
   sudo chroot /mnt/newroot /bin/bash
   ```

2. 修复系统时切换到损坏的系统盘

   ```bash
   sudo chroot /mnt/rescue
   ```

**相关命令：** `systemd-nspawn`、`docker`、`jail`

**标签：** 隔离、根目录、沙箱、切换、修复、系统

---

**fg**　`低危`

> 将后台作业恢复到前台运行

**语法：**

```bash
fg [作业号]
```

**示例：**

1. 将最后一个后台任务恢复到前台

   ```bash
   fg
   ```

2. 将指定作业号的任务恢复到前台

   ```bash
   fg %1
   ```

**相关命令：** `bg`、`jobs`

**标签：** 前台、恢复、后台、作业

---

**htop**　`低危`

> 交互式进程查看器（top 的增强版）

**语法：**

```bash
htop [选项]
```

**常用参数：**
- `-u`：只显示指定用户的进程
- `-p`：只显示指定 PID

**示例：**

1. 启动交互式进程查看

   ```bash
   htop
   ```

2. 只显示指定用户的进程

   ```bash
   htop -u username
   ```

**相关命令：** `top`、`ps`、`btop`、`glances`

**标签：** 进程、监控、实时、资源、交互、查看

---

**ionice**　`中危`

> 设置或查看进程的 I/O 调度优先级

**语法：**

```bash
ionice [选项] -p PID
```

**常用参数：**
- `-c`：调度类别（1=实时, 2=尽力, 3=空闲）
- `-n`：优先级（0-7, 0 最高）
- `-p`：指定 PID

**示例：**

1. 以空闲 I/O 优先级运行命令

   ```bash
   ionice -c 3 cp large_file /backup/
   ```

2. 查看进程 I/O 优先级

   ```bash
   ionice -p 1234
   ```

**相关命令：** `nice`、`renice`、`taskset`、`iotop`

**标签：** IO、优先级、磁盘、调度、进程

---

**jobs**　`低危`

> 显示当前 shell 的后台作业

**语法：**

```bash
jobs [选项]
```

**常用参数：**
- `-l`：显示 PID 和作业信息
- `-p`：只显示 PID

**示例：**

1. 列出所有后台作业

   ```bash
   jobs
   ```

2. 列出作业及 PID

   ```bash
   jobs -l
   ```

3. 将前台任务放到后台

   ```bash
   command &
   ```

**相关命令：** `bg`、`fg`、`nohup`、`disown`、`&`

**标签：** 后台、作业、查看、任务、shell

---

**journalctl**　`低危`

> 查看 systemd 日志

**语法：**

```bash
journalctl [选项]
```

**常用参数：**
- `-u`：查看指定服务的日志
- `-f`：实时跟踪日志
- `--since`：从指定时间开始查看
- `-n`：显示最后 N 行
- `-b`：显示本次启动以来的日志

**示例：**

1. 查看所有日志

   ```bash
   journalctl
   ```

2. 查看指定服务日志

   ```bash
   journalctl -u nginx
   ```

3. 实时跟踪日志

   ```bash
   journalctl -f
   ```

4. 查看今天的日志

   ```bash
   journalctl --since today
   ```

**相关命令：** `systemctl`、`dmesg`、`tail`、`rsyslog`

**标签：** 日志、查看、systemd、服务、启动

---

**kill**　`极高危`

> 向进程发送信号（通常用于终止进程）

**语法：**

```bash
kill [选项] <PID>
```

**常用参数：**
- `-9`：强制终止（SIGKILL）
- `-15`：正常终止（SIGTERM，默认）
- `-l`：列出所有可用的信号
- `-HUP`：挂起信号，常用于重载配置

**示例：**

1. 正常终止进程

   ```bash
   kill 1234
   ```

2. 强制终止进程

   ```bash
   kill -9 1234
   ```

3. 重载进程配置

   ```bash
   kill -HUP 1234
   ```

4. 列出所有信号

   ```bash
   kill -l
   ```

**相关命令：** `killall`、`pkill`、`ps`、`top`、`pgrep`

**标签：** 终止、结束、杀掉、进程、信号、停止、强制

---

**killall**　`高危`

> 按进程名终止所有匹配的进程

**语法：**

```bash
killall [选项] 进程名
```

**常用参数：**
- `-9`：强制终止
- `-i`：终止前询问确认
- `-u`：只终止指定用户的进程

**示例：**

1. 终止所有 nginx 进程

   ```bash
   sudo killall nginx
   ```

2. 交互式终止（确认）

   ```bash
   killall -i node
   ```

3. 强制终止所有匹配进程

   ```bash
   killall -9 python
   ```

**相关命令：** `kill`、`pkill`、`pidof`

**标签：** 终止、结束、杀掉、进程、名字、批量

---

**lsof**　`低危`

> 列出当前系统打开的文件（List Open Files）——Linux 一切皆文件，lsof 能查看进程打开的文件、网络连接、设备、管道等，是排查「端口被占用」「文件被谁锁住」等问题的利器

**语法：**

```bash
lsof [选项] [文件/目录/端口]
```

**常用参数：**
- `-i`：筛选网络连接，格式：-i [协议][@主机][:端口]，如 -i tcp:80、-i :8080
- `-u`：只显示指定用户打开的文件，如 -u root
- `-p`：只显示指定进程 PID 打开的文件，多个 PID 用逗号分隔
- `-c`：只显示指定命令名的进程打开的文件，如 -c nginx
- `+D`：递归显示某目录下被打开的所有文件，如 +D /var/log
- `-t`：仅输出 PID（不显示其他信息），适合管道给 kill，如 lsof -ti :8080 | xargs kill
- `-d`：仅显示指定文件描述符的文件，如 -d 0-2（stdin/stdout/stderr）
- `-n`：不解析主机名（加速输出，避免 DNS 查询）
- `-P`：不解析端口号对应的服务名（显示 80 而非 http）
- `-a`：AND 逻辑组合多个条件（默认是 OR），如 lsof -a -u root -i tcp

**示例：**

1. 查看谁占用了 80 端口

   ```bash
   lsof -i :80
   ```

2. 查看所有 TCP 连接

   ```bash
   lsof -i tcp
   ```

3. 查看进程 1234 打开的所有文件

   ```bash
   lsof -p 1234
   ```

4. 查看 root 用户打开的文件

   ```bash
   lsof -u root
   ```

5. 查看 nginx 进程打开的文件

   ```bash
   lsof -c nginx
   ```

6. 找出占用某端口的所有进程 PID 并杀死

   ```bash
   lsof -ti :8080 | xargs kill -9
   ```

7. 查看某目录下被打开的文件（谁在使用 /var/log）

   ```bash
   lsof +D /var/log
   ```

8. 查看被删除但仍被进程占用的文件（释放磁盘空间排查）

   ```bash
   lsof | grep deleted
   ```

9. 组合条件：root 用户的 TCP 连接（AND 逻辑）

   ```bash
   lsof -a -u root -i tcp
   ```

**相关命令：** `ss`、`netstat`、`fuser`、`ps`、`strace`、`lscpu`

**标签：** 文件、进程、端口、打开、查看、占用、网络、排查、调试、锁定、连接、socket

---

**nice**　`中危`

> 以指定优先级运行程序

**语法：**

```bash
nice [-n 优先级] 命令
```

**常用参数：**
- `-n`：设置优先级（-20 最高, 19 最低）

**示例：**

1. 以低优先级运行编译

   ```bash
   nice -n 19 make
   ```

2. 以高优先级运行

   ```bash
   nice -n -10 ./important_task
   ```

**相关命令：** `renice`、`top`、`ionice`

**标签：** 优先级、进程、调度、CPU、运行

---

**nohup**　`低危`

> 运行命令不受终端挂断影响

**语法：**

```bash
nohup 命令 [参数] &
```

**示例：**

1. 在后台持续运行脚本

   ```bash
   nohup ./long_script.sh &
   ```

2. 运行并将输出保存到文件

   ```bash
   nohup python app.py > output.log 2>&1 &
   ```

**相关命令：** `disown`、`screen`、`tmux`、`bg`

**标签：** 后台、持续、运行、终端、退出

---

**pgrep**　`低危`

> 按进程名搜索并返回 PID

**语法：**

```bash
pgrep [选项] 进程名
```

**常用参数：**
- `-l`：同时显示进程名和 PID
- `-u`：只匹配指定用户的进程

**示例：**

1. 查找 nginx 的 PID

   ```bash
   pgrep nginx
   ```

2. 显示进程名和 PID

   ```bash
   pgrep -l nginx
   ```

**相关命令：** `pkill`、`pidof`、`ps`、`kill`

**标签：** 进程、查找、搜索、PID、名字

---

**pkill**　`高危`

> 按进程名发送信号

**语法：**

```bash
pkill [选项] 进程名
```

**常用参数：**
- `-9`：强制终止
- `-u`：只匹配指定用户的进程

**示例：**

1. 终止所有 nginx 进程

   ```bash
   sudo pkill nginx
   ```

2. 强制终止指定用户的进程

   ```bash
   pkill -9 -u username process
   ```

**相关命令：** `pgrep`、`kill`、`killall`、`pidof`

**标签：** 进程、终止、信号、名字、关闭

---

**ps**　`低危`

> 查看当前运行的进程信息

**语法：**

```bash
ps [选项]
```

**常用参数：**
- `aux`：显示所有用户的所有进程（BSD 风格）
- `-ef`：显示所有进程（标准风格）
- `-u`：指定用户查看进程
- `--sort`：按指定字段排序

**示例：**

1. 查看所有进程（详细）

   ```bash
   ps aux
   ```

2. 按内存使用排序显示进程

   ```bash
   ps aux --sort=-%mem
   ```

3. 查看特定用户的进程

   ```bash
   ps -u username
   ```

4. 查找特定进程

   ```bash
   ps aux | grep nginx
   ```

**相关命令：** `top`、`htop`、`kill`、`pgrep`、`pidof`

**标签：** 进程、查看、运行、程序、列表、状态

---

**renice**　`中危`

> 修改正在运行进程的优先级

**语法：**

```bash
renice [-n] 优先级 [-p] PID
```

**示例：**

1. 降低进程优先级

   ```bash
   sudo renice -n 10 -p 1234
   ```

2. 提高进程优先级

   ```bash
   sudo renice -n -5 -p 1234
   ```

**相关命令：** `nice`、`top`、`ps`

**标签：** 优先级、修改、进程、调整

---

**screen**　`低危`

> 终端复用器（保持会话不中断）

**语法：**

```bash
screen [选项]
```

**常用参数：**
- `-S`：指定会话名称
- `-ls`：列出所有会话
- `-r`：重新连接会话

**示例：**

1. 创建新会话

   ```bash
   screen -S mysession
   ```

2. 列出所有会话

   ```bash
   screen -ls
   ```

3. 重新连接会话

   ```bash
   screen -r mysession
   ```

4. 分离当前会话

   ```bash
   Ctrl+A 然后按 D
   ```

**相关命令：** `tmux`、`nohup`、`byobu`

**标签：** 终端、会话、后台、复用、保持、多路

---

**service**　`高危`

> 管理 SysV init 服务（传统 init 系统）

**语法：**

```bash
service 服务名 命令
```

**示例：**

1. 启动服务

   ```bash
   sudo service nginx start
   ```

2. 查看服务状态

   ```bash
   sudo service nginx status
   ```

3. 重启服务

   ```bash
   sudo service nginx restart
   ```

**相关命令：** `systemctl`、`systemd`、`chkconfig`

**标签：** 服务、启动、停止、重启、SysV、init

---

**strace**　`低危`

> 跟踪进程的系统调用和信号

**语法：**

```bash
strace [选项] 命令
```

**常用参数：**
- `-p`：跟踪指定 PID
- `-e`：只跟踪指定系统调用
- `-c`：统计系统调用次数和时间
- `-o`：输出到文件

**示例：**

1. 跟踪命令执行

   ```bash
   strace ls
   ```

2. 跟踪运行中的进程

   ```bash
   strace -p 1234
   ```

3. 只跟踪文件操作

   ```bash
   strace -e trace=file ls
   ```

4. 统计系统调用耗时

   ```bash
   strace -c ls
   ```

**相关命令：** `ltrace`、`gdb`、`perf`、`lsof`

**标签：** 调试、跟踪、系统调用、诊断、进程

---

**systemctl**　`高危`

> 管理 systemd 系统和服务

**语法：**

```bash
systemctl [命令] [服务名]
```

**常用参数：**
- `start`：启动服务
- `stop`：停止服务
- `restart`：重启服务
- `enable`：设置开机自启
- `disable`：取消开机自启
- `status`：查看服务状态

**示例：**

1. 启动服务

   ```bash
   sudo systemctl start nginx
   ```

2. 查看服务状态

   ```bash
   sudo systemctl status nginx
   ```

3. 设置开机自启

   ```bash
   sudo systemctl enable nginx
   ```

4. 重启服务

   ```bash
   sudo systemctl restart nginx
   ```

**相关命令：** `service`、`journalctl`、`init.d`

**标签：** 服务、启动、停止、重启、systemd、守护、管理

---

**taskset**　`中危`

> 设置或查看进程的 CPU 亲和性

**语法：**

```bash
taskset [选项] CPU掩码 命令
```

**常用参数：**
- `-p`：操作已存在的进程
- `-c`：使用 CPU 列表格式（如 0,2,4-6）

**示例：**

1. 将进程绑定到 CPU 0

   ```bash
   taskset -c 0 ./my_program
   ```

2. 修改已有进程的 CPU 亲和性

   ```bash
   taskset -cp 0,2 1234
   ```

3. 查看进程 CPU 亲和性

   ```bash
   taskset -cp 1234
   ```

**相关命令：** `nice`、`renice`、`ionice`、`numactl`

**标签：** CPU、亲和性、绑定、进程、性能

---

**tmux**　`低危`

> 现代终端复用器（比 screen 更强大）

**语法：**

```bash
tmux [命令]
```

**常用参数：**
- `new`：新建会话
- `attach`：重新连接会话
- `ls`：列出所有会话

**示例：**

1. 创建命名会话

   ```bash
   tmux new -s mysession
   ```

2. 列出所有会话

   ```bash
   tmux ls
   ```

3. 重新连接会话

   ```bash
   tmux attach -t mysession
   ```

4. 水平分屏

   ```bash
   (在 tmux 内) Ctrl+B 然后按 "
   ```

**相关命令：** `screen`、`nohup`、`byobu`

**标签：** 终端、会话、分屏、复用、多窗口

---

**top**　`低危`

> 实时显示系统进程和资源使用情况

**语法：**

```bash
top [选项]
```

**常用参数：**
- `-u`：只显示指定用户的进程
- `-p`：只监控指定 PID
- `-d`：指定刷新间隔（秒）
- `-o`：按指定字段排序

**示例：**

1. 启动实时进程监控

   ```bash
   top
   ```

2. 每 2 秒刷新一次

   ```bash
   top -d 2
   ```

3. 只监控特定进程

   ```bash
   top -p 1234
   ```

**相关命令：** `htop`、`ps`、`vmstat`、`glances`

**标签：** 进程、监控、实时、资源、CPU、内存、性能

---

#### 系统信息

**dmesg**　`低危`

> 查看内核环形缓冲区日志

**语法：**

```bash
dmesg [选项]
```

**常用参数：**
- `-T`：显示人类可读的时间戳
- `--level`：按日志级别过滤（err, warn, info）

**示例：**

1. 查看内核日志

   ```bash
   dmesg
   ```

2. 只查看错误日志

   ```bash
   dmesg --level=err
   ```

3. 查看带可读时间的日志

   ```bash
   dmesg -T | tail
   ```

**相关命令：** `journalctl`、`syslog`、`lspci`

**标签：** 内核、日志、查看、启动、硬件、驱动、错误

---

**free**　`低危`

> 查看系统内存使用情况

**语法：**

```bash
free [选项]
```

**常用参数：**
- `-h`：人类可读格式
- `-s`：持续监控（指定秒数间隔）

**示例：**

1. 查看内存使用（人类可读）

   ```bash
   free -h
   ```

2. 每 2 秒刷新一次内存使用

   ```bash
   free -h -s 2
   ```

**相关命令：** `top`、`vmstat`、`htop`、`smem`

**标签：** 内存、RAM、查看、使用、剩余、交换

---

**hostname**　`低危`

> 显示或设置系统主机名

**语法：**

```bash
hostname [选项]
```

**常用参数：**
- `-I`：显示本机所有 IP 地址

**示例：**

1. 查看主机名

   ```bash
   hostname
   ```

2. 查看 IP 地址

   ```bash
   hostname -I
   ```

**相关命令：** `uname`、`hostnamectl`

**标签：** 主机、名字、系统、查看

---

**iostat**　`低危`

> 查看 CPU 和磁盘 I/O 统计

**语法：**

```bash
iostat [选项] [间隔] [次数]
```

**常用参数：**
- `-x`：显示扩展统计
- `-d`：只显示磁盘统计
- `-c`：只显示 CPU 统计

**示例：**

1. 查看 I/O 统计

   ```bash
   iostat
   ```

2. 每 1 秒刷新扩展统计

   ```bash
   iostat -x 1
   ```

3. 只查看磁盘 I/O

   ```bash
   iostat -d 2 5
   ```

**相关命令：** `vmstat`、`mpstat`、`iotop`、`sar`

**标签：** IO、磁盘、CPU、性能、统计、监控

---

**lsblk**　`低危`

> 列出块设备信息（磁盘、分区）

**语法：**

```bash
lsblk [选项]
```

**常用参数：**
- `-f`：显示文件系统和 UUID
- `-o`：自定义输出列

**示例：**

1. 查看所有块设备

   ```bash
   lsblk
   ```

2. 查看设备及文件系统

   ```bash
   lsblk -f
   ```

**相关命令：** `fdisk`、`blkid`、`df`、`mount`

**标签：** 磁盘、分区、设备、查看、块、USB

---

**lscpu**　`低危`

> 显示 CPU 架构信息，包括型号、核数、线程数、缓存大小、NUMA 拓扑等

**语法：**

```bash
lscpu [选项]
```

**常用参数：**
- `-a`：同时显示在线和离线 CPU
- `-c`：仅显示离线 CPU
- `-e`：以可解析的格式显示（等号分隔的键值对）
- `-p`：仅显示在线 CPU
- `-x`：显示十六进制掩码（如 CPU 掩码）
- `-J`：以 JSON 格式输出
- `-s`：仅显示指定缓存层级的信息（如 -s 1 显示 L1 缓存）
- `--parse`：输出解析友好的格式，适合脚本处理

**示例：**

1. 查看 CPU 完整信息（型号、核数、线程、缓存、NUMA）

   ```bash
   lscpu
   ```

2. 只查看 CPU 核数

   ```bash
   lscpu | grep '^CPU(s):'
   ```

3. 查看 CPU 型号名称

   ```bash
   lscpu | grep 'Model name'
   ```

4. 以 JSON 格式输出（方便脚本解析）

   ```bash
   lscpu -J
   ```

5. 查看每个核的在线状态

   ```bash
   lscpu -e
   ```

6. 查看 CPU 是否支持虚拟化

   ```bash
   lscpu | grep -i virt
   ```

7. 查看 L1/L2/L3 各级缓存大小

   ```bash
   lscpu | grep -E 'L1|L2|L3'
   ```

**相关命令：** `lspci`、`lsusb`、`lshw`、`nproc`、`cat /proc/cpuinfo`、`dmidecode`、`cpuinfo`

**标签：** CPU、处理器、信息、查看、核、架构、硬件、缓存、NUMA、线程、型号

---

**uname**　`低危`

> 显示系统基本信息

**语法：**

```bash
uname [选项]
```

**常用参数：**
- `-a`：显示所有信息
- `-r`：内核版本
- `-m`：硬件架构
- `-s`：内核名称

**示例：**

1. 显示所有系统信息

   ```bash
   uname -a
   ```

2. 查看内核版本

   ```bash
   uname -r
   ```

3. 查看硬件架构

   ```bash
   uname -m
   ```

**相关命令：** `hostname`、`arch`、`lsb_release`、`neofetch`

**标签：** 系统、信息、内核、版本、架构、主机

---

**uptime**　`低危`

> 显示系统运行时间和负载

**语法：**

```bash
uptime [选项]
```

**常用参数：**
- `-p`：以美观格式显示运行时间

**示例：**

1. 查看系统运行时间

   ```bash
   uptime
   ```

2. 美观显示运行时间

   ```bash
   uptime -p
   ```

**相关命令：** `w`、`top`、`who`

**标签：** 运行、时间、负载、系统、启动

---

**vmstat**　`低危`

> 查看系统虚拟内存和整体性能统计

**语法：**

```bash
vmstat [间隔] [次数]
```

**常用参数：**
- `-s`：显示内存统计摘要
- `-d`：显示磁盘统计

**示例：**

1. 查看内存和 CPU 统计

   ```bash
   vmstat
   ```

2. 每 2 秒刷新 5 次

   ```bash
   vmstat 2 5
   ```

3. 显示内存统计摘要

   ```bash
   vmstat -s
   ```

**相关命令：** `free`、`iostat`、`top`、`sar`

**标签：** 内存、性能、虚拟、统计、查看、监控

---

#### 文本处理

**awk**　`中危`

> 强大的文本处理语言，按列/字段处理数据

**语法：**

```bash
awk [选项] '程序' [文件...]
```

**常用参数：**
- `-F`：指定字段分隔符
- `-v`：设置变量

**示例：**

1. 打印第 1 和第 3 列

   ```bash
   awk '{print $1, $3}' file.txt
   ```

2. 以逗号为分隔符处理

   ```bash
   awk -F',' '{print $2}' data.csv
   ```

3. 对第 2 列求和

   ```bash
   awk '{sum += $2} END {print sum}' file.txt
   ```

4. 按条件过滤行

   ```bash
   awk '$3 > 100 {print $0}' file.txt
   ```

5. 打印行号

   ```bash
   awk '{print NR": "$0}' file.txt
   ```

**相关命令：** `sed`、`grep`、`cut`、`sort`

**标签：** 文本、处理、列、字段、分隔、统计、格式化、报表

---

**column**　`低危`

> 将文本格式化为对齐的列

**语法：**

```bash
column [选项] [文件]
```

**常用参数：**
- `-t`：按空格分隔并自动对齐
- `-s`：指定分隔符
- `-o`：指定输出分隔符

**示例：**

1. 格式化 mount 输出为表格

   ```bash
   mount | column -t
   ```

2. 以逗号分隔并格式化

   ```bash
   column -t -s',' data.csv
   ```

**相关命令：** `pr`、`paste`、`fmt`

**标签：** 列、格式化、对齐、表格、显示

---

**comm**　`低危`

> 逐行比较两个已排序的文件

**语法：**

```bash
comm [选项] 文件1 文件2
```

**常用参数：**
- `-1`：隐藏只在文件1中的行
- `-2`：隐藏只在文件2中的行
- `-3`：隐藏两个文件共有的行

**示例：**

1. 找出两文件共有的行（交集）

   ```bash
   comm -12 file1.txt file2.txt
   ```

2. 找出只在文件1中的行

   ```bash
   comm -23 file1.txt file2.txt
   ```

**相关命令：** `diff`、`sort`、`uniq`、`join`

**标签：** 比较、文件、差异、交集、排序

---

**cut**　`低危`

> 提取文本行中的指定字段或字符

**语法：**

```bash
cut [选项] [文件...]
```

**常用参数：**
- `-d`：指定字段分隔符
- `-f`：选择字段（列）
- `-c`：选择字符位置

**示例：**

1. 提取以冒号分隔的第 1 列

   ```bash
   cut -d':' -f1 /etc/passwd
   ```

2. 提取第 2 和第 4 列（逗号分隔）

   ```bash
   cut -d',' -f2,4 data.csv
   ```

3. 提取每行第 1-5 个字符

   ```bash
   cut -c1-5 file.txt
   ```

**相关命令：** `awk`、`paste`、`sed`、`colrm`

**标签：** 列、字段、提取、分割、文本、裁剪

---

**diff**　`低危`

> 逐行比较两个文件

**语法：**

```bash
diff [选项] 文件1 文件2
```

**常用参数：**
- `-u`：统一格式输出（类似 git diff）
- `-r`：递归比较目录
- `-q`：只报告文件是否不同
- `--color`：彩色输出

**示例：**

1. 比较两个文件的差异

   ```bash
   diff file1.txt file2.txt
   ```

2. 统一格式（人类可读）比较

   ```bash
   diff -u old.txt new.txt
   ```

3. 递归比较两个目录

   ```bash
   diff -r dir1 dir2
   ```

**相关命令：** `cmp`、`comm`、`patch`、`git`

**标签：** 比较、差异、对比、文件、区别

---

**grep**　`低危`

> 在文本中搜索匹配指定模式的行——Linux 最常用的文本搜索工具

**语法：**

```bash
grep [选项] 模式 [文件...]
```

**常用参数：**
- `-i`：忽略大小写（常用）
- `-v`：反向匹配——排除包含模式的行（常用）
- `-r`：递归搜索整个目录
- `-n`：显示匹配行的行号
- `-c`：只统计匹配行数，不输出内容
- `-l`：只输出包含匹配的文件名（不输出匹配行）
- `-L`：只输出不包含匹配的文件名
- `-w`：全词匹配（如 grep -w 'abc' 不匹配 abcd）
- `-o`：只输出匹配的部分（而非整行）
- `-m N`：最多匹配 N 行后停止
- `-A N`：同时显示匹配行之后的 N 行（After）
- `-B N`：同时显示匹配行之前的 N 行（Before）
- `-C N`：同时显示匹配行前后各 N 行（Context）
- `-E`：启用扩展正则表达式（支持 | + ? {} ）
- `-P`：启用 Perl 兼容正则（PCRE，支持更高级语法）
- `-H`：始终显示文件名（多文件时默认行为）
- `-h`：不显示文件名
- `-q`：静默模式——不输出，只返回退出码（脚本中用）
- `--color=auto`：高亮匹配的文本

**示例：**

1. 基本搜索：在文件中查找关键字

   ```bash
   grep "error" app.log
   ```

2. 忽略大小写搜索

   ```bash
   grep -i "error" app.log
   ```

3. 递归搜索目录中所有文件

   ```bash
   grep -r "TODO" ./src/
   ```

4. 显示匹配行及行号

   ```bash
   grep -n "function" app.js
   ```

5. 统计错误出现次数

   ```bash
   grep -c "ERROR" /var/log/syslog
   ```

6. 排除注释行和空行查看配置

   ```bash
   grep -v -E "^#|^$" nginx.conf
   ```

7. 显示匹配行及上下文（前后各 3 行）

   ```bash
   grep -C 3 "exception" app.log
   ```

8. 仅输出匹配的 IP 地址

   ```bash
   grep -oE '[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}' access.log
   ```

9. 全词匹配（避免误匹配子串）

   ```bash
   grep -w 'abc' file.txt
   ```

10. 列出包含匹配的文件名

   ```bash
   grep -rl "config" /etc/
   ```

11. 从管道读取（组合其他命令）

   ```bash
   ps aux | grep nginx
   ```

12. 使用正则匹配多种错误类型

   ```bash
   grep -E "(error|fail|fatal|critical)" app.log
   ```

13. 搜索并排除二进制文件

   ```bash
   grep -rI "pattern" ./
   ```

14. 【日志排查】跟踪实时日志中的错误

   ```bash
   tail -f /var/log/syslog | grep --color=auto "ERROR"
   ```

15. 【日志排查】查看某时间段日志（如 10:00 到 10:30）

   ```bash
   grep -E "2026-07-29 10:[0-2][0-9]" app.log | grep "error"
   ```

16. 【日志排查】查找前后 10 行上下文以了解错误原因

   ```bash
   grep -B 10 -A 10 "FATAL" app.log
   ```

17. 【日志排查】统计各错误类型的数量

   ```bash
   grep -oE "(ERROR|WARN|INFO|DEBUG)" app.log | sort | uniq -c | sort -rn
   ```

18. 【日志排查】排查特定时间段内 500 错误

   ```bash
   grep "29/Jul/2026" access.log | grep " 500 "
   ```

19. 【日志排查】从压缩日志中搜索（不解压）

   ```bash
   zgrep "error" app.log.1.gz
   ```

20. 【性能排查】查找慢请求（超过 1000ms）

   ```bash
   grep -E '[0-9]{4,}ms' slow_query.log
   ```

21. 多文件搜索（自动显示文件名）

   ```bash
   grep "config" *.yml
   ```

22. 查找非空行

   ```bash
   grep -v "^$" file.txt
   ```

23. 脚本中静默检查是否存在匹配

   ```bash
   if grep -q "healthy" /var/log/health.log; then echo 'OK'; fi
   ```

24. 与 find 结合：在所有 .log 文件中搜索

   ```bash
   find . -name "*.log" -exec grep -l "error" {} \;
   ```

**相关命令：** `sed`、`awk`、`tail`、`less`、`cat`、`zgrep`、`rg`、`ack`、`ag`

**标签：** 搜索、查找、文本、匹配、过滤、正则、关键字、日志、筛选

---

**jq**　`低危`

> 命令行 JSON 处理工具

**语法：**

```bash
jq [选项] 过滤器 [文件]
```

**常用参数：**
- `-r`：输出原始字符串（不带引号）
- `-c`：紧凑输出
- `-s`：将输入视为数组

**示例：**

1. 美化 JSON 输出

   ```bash
   cat data.json | jq .
   ```

2. 提取字段

   ```bash
   jq -r '.name' data.json
   ```

3. 过滤数组元素

   ```bash
   jq '.[] | select(.age > 18)' users.json
   ```

4. 从 curl API 响应提取数据

   ```bash
   curl -s api.example.com | jq '.data[0].id'
   ```

**相关命令：** `yq`、`json_pp`、`python`

**标签：** JSON、处理、查询、格式化、API、解析、过滤

---

**paste**　`低危`

> 并行合并文件的行（按列拼接）

**语法：**

```bash
paste [选项] [文件...]
```

**常用参数：**
- `-d`：指定分隔符（默认 Tab）
- `-s`：串行合并（按行而非列）

**示例：**

1. 并排合并两个文件

   ```bash
   paste file1.txt file2.txt
   ```

2. 用逗号合并为 CSV

   ```bash
   paste -d',' names.txt ages.txt
   ```

3. 将多行转为一列

   ```bash
   paste -s file.txt
   ```

**相关命令：** `cut`、`join`、`column`、`pr`

**标签：** 合并、列、拼接、文件、并行

---

**sed**　`中危`

> 流编辑器，对文本进行过滤和转换

**语法：**

```bash
sed [选项] '命令' [文件...]
```

**常用参数：**
- `-i`：直接修改文件（原地编辑）
- `-e`：指定要执行的脚本
- `-n`：抑制自动输出

**示例：**

1. 替换文件中的字符串

   ```bash
   sed 's/old/new/g' file.txt
   ```

2. 原地替换（直接修改文件）

   ```bash
   sed -i 's/foo/bar/g' file.txt
   ```

3. 删除包含模式的行

   ```bash
   sed '/pattern/d' file.txt
   ```

4. 只显示第 5 到 10 行

   ```bash
   sed -n '5,10p' file.txt
   ```

5. 在每行开头添加内容

   ```bash
   sed 's/^/PREFIX: /' file.txt
   ```

**相关命令：** `awk`、`grep`、`tr`、`perl`

**标签：** 替换、编辑、文本、流、修改、处理、正则

---

**sort**　`低危`

> 对文本行进行排序

**语法：**

```bash
sort [选项] [文件...]
```

**常用参数：**
- `-n`：按数值排序
- `-r`：反向排序（降序）
- `-k`：指定排序的列
- `-u`：去重（仅保留唯一行）
- `-t`：指定字段分隔符
- `-h`：人类可读的大小排序（如 2K, 1G）

**示例：**

1. 按字母序排序

   ```bash
   sort file.txt
   ```

2. 按数值降序排序

   ```bash
   sort -nr numbers.txt
   ```

3. 按第 2 列排序（逗号分隔）

   ```bash
   sort -t',' -k2 data.csv
   ```

4. 去重排序

   ```bash
   sort -u file.txt
   ```

5. 人类可读大小排序

   ```bash
   du -h | sort -hr
   ```

**相关命令：** `uniq`、`awk`、`comm`

**标签：** 排序、文本、升序、降序、排列

---

**tac**　`低危`

> 反向输出文件内容（cat 的反写）

**语法：**

```bash
tac [选项] [文件...]
```

**常用参数：**
- `-s`：指定分隔符（默认换行）
- `-b`：在分隔符之前而非之后连接

**示例：**

1. 反向显示文件内容

   ```bash
   tac file.txt
   ```

2. 与 tail 组合取倒数几行

   ```bash
   tac file.txt | head -5
   ```

**相关命令：** `cat`、`rev`、`tail`、`sort`

**标签：** 反向、倒序、cat、文件、查看

---

**tee**　`低危`

> 从标准输入读取，同时写入文件和标准输出

**语法：**

```bash
tee [选项] [文件...]
```

**常用参数：**
- `-a`：追加而非覆盖

**示例：**

1. 同时输出到终端和文件

   ```bash
   ls -l | tee output.txt
   ```

2. 追加到文件

   ```bash
   echo "new line" | tee -a log.txt
   ```

**相关命令：** `cat`、`script`、`>`

**标签：** 输出、保存、同时、日志、管道

---

**tr**　`中危`

> 翻译或删除字符

**语法：**

```bash
tr [选项] 集合1 [集合2]
```

**常用参数：**
- `-d`：删除指定字符
- `-s`：压缩重复字符

**示例：**

1. 大小写转换

   ```bash
   echo "Hello" | tr '[:lower:]' '[:upper:]'
   ```

2. 删除 Windows 换行符

   ```bash
   tr -d '\r' < dos.txt > unix.txt
   ```

3. 将多个空格压缩为一个

   ```bash
   tr -s ' '
   ```

4. 替换特定字符

   ```bash
   echo "a,b,c" | tr ',' '\t'
   ```

**相关命令：** `sed`、`awk`、`iconv`

**标签：** 替换、转换、删除、字符、大小写、翻译

---

**uniq**　`低危`

> 报告或省略重复的行

**语法：**

```bash
uniq [选项] [输入] [输出]
```

**常用参数：**
- `-c`：在每行前显示重复次数
- `-d`：只显示重复的行
- `-u`：只显示唯一的行（不重复）

**示例：**

1. 去重（需先排序）

   ```bash
   sort file.txt | uniq
   ```

2. 统计每行出现次数

   ```bash
   sort file.txt | uniq -c
   ```

3. 只显示重复的行

   ```bash
   sort file.txt | uniq -d
   ```

4. 按频率排序显示最高频的行

   ```bash
   sort file.txt | uniq -c | sort -rn
   ```

**相关命令：** `sort`、`comm`、`awk`

**标签：** 去重、重复、唯一、统计、文本

---

**vi**　`低危`

> Unix 标准文本编辑器——所有 Linux/Unix 系统预装。vim 的前身，操作方式与 vim 基本兼容。也是 vim 的兼容模式的别名

**语法：**

```bash
vi [选项] [文件...]
```

**常用参数：**
- `+N`：打开文件并跳到第 N 行
- `+/pat`：打开文件并跳到第一个匹配行
- `-r`：恢复上次崩溃时未保存的编辑内容
- `-R`：只读模式打开文件
- `-c cmd`：启动后自动执行 Ex 命令

**示例：**

1. 【打开文件】打开或新建文件

   ```bash
   vi file.txt
   ```

2. 【打开文件】跳到第 100 行

   ```bash
   vi +100 app.log
   ```

3. 【打开文件】跳到第一个 'error' 处

   ```bash
   vi +/error /var/log/syslog
   ```

4. 【打开文件】恢复未保存的编辑（崩溃后）

   ```bash
   vi -r file.txt
   ```

5. 【模式切换】进入插入模式（开始编辑）

   ```bash
   按 i（光标前插入）或 a（光标后追加）或 o（下一行插入）
   ```

6. 【模式切换】返回命令模式

   ```bash
   按 Esc
   ```

7. 【模式切换】进入命令行模式

   ```bash
   在命令模式下按 :
   ```

8. 【保存退出】保存并退出

   ```bash
   在命令行模式输入 :wq 然后回车
   ```

9. 【保存退出】不保存强制退出

   ```bash
   在命令行模式输入 :q! 然后回车
   ```

10. 【保存退出】快捷键保存退出

   ```bash
   在命令模式下按 ZZ
   ```

11. 【光标移动】基本移动（推荐替代方向键）

   ```bash
   h 左 / j 下 / k 上 / l 右
   ```

12. 【光标移动】跳到文件头尾

   ```bash
   1G 或 gg 到开头 / G 到末尾
   ```

13. 【编辑】删除一行

   ```bash
   在命令模式下按 dd
   ```

14. 【编辑】复制一行（yank）

   ```bash
   在命令模式下按 yy
   ```

15. 【编辑】粘贴

   ```bash
   在命令模式下按 p
   ```

16. 【编辑】撤销

   ```bash
   在命令模式下按 u
   ```

17. 【搜索】搜索关键字

   ```bash
   在命令模式下按 /keyword 然后回车
   ```

18. 【搜索】跳转到下一个匹配

   ```bash
   按 n
   ```

19. 【搜索替换】替换当前行的第一个匹配

   ```bash
   在命令行模式 :s/old/new/
   ```

20. 【搜索替换】全局替换

   ```bash
   在命令行模式 :%s/old/new/g
   ```

21. 【查看日志】打开大日志文件并跳到末尾

   ```bash
   vi + /var/log/syslog
   ```

22. 【查看日志】打开日志并直接搜索 ERROR

   ```bash
   vi +/ERROR /var/log/syslog
   ```

23. 【查看日志】显示行号

   ```bash
   在命令行模式 :set number
   ```

24. 【查看日志】跳到指定行

   ```bash
   在命令行模式 :5000 跳到第 5000 行
   ```

**相关命令：** `vim`、`nano`、`emacs`、`ed`、`sed`、`less`、`grep`

**标签：** 编辑、编辑器、文本、vi、修改、文件、编写、基础、日志

---

**vim**　`低危`

> Vi IMproved——Unix/Linux 下最强大的终端文本编辑器。模态编辑器：在不同模式下按键有不同含义（Normal 模式浏览，Insert 模式输入，Command 模式执行命令）

**语法：**

```bash
vim [选项] [文件...]
```

**常用参数：**
- `+N`：打开文件并跳转到第 N 行
- `+/pat`：打开文件并跳到第一个匹配行
- `-R`：只读模式（view 命令等同）
- `-b`：二进制模式
- `-d`：差异模式——对比两个文件（vdiff）
- `-o N`：水平分屏打开 N 个文件
- `-O N`：垂直分屏打开 N 个文件
- `-c cmd`：启动后自动执行 Ex 命令
- `-u vimrc`：使用指定的配置文件

**示例：**

1. 【打开文件】基本打开

   ```bash
   vim file.txt
   ```

2. 【打开文件】跳到第 50 行

   ```bash
   vim +50 app.log
   ```

3. 【打开文件】跳到第一个 'error' 处

   ```bash
   vim +/error app.log
   ```

4. 【打开文件】只读模式查看（保护文件不被误改）

   ```bash
   vim -R /etc/nginx/nginx.conf
   ```

5. 【模式切换】进入编辑模式（插入文本）

   ```bash
   在 Normal 模式下按 i
   ```

6. 【模式切换】在行尾插入（追加）

   ```bash
   在 Normal 模式下按 A
   ```

7. 【模式切换】返回 Normal 模式

   ```bash
   按 Esc 或 Ctrl+[
   ```

8. 【模式切换】进入命令行模式

   ```bash
   在 Normal 模式下按 :
   ```

9. 【模式切换】进入可视模式（选择文本）

   ```bash
   在 Normal 模式下按 v
   ```

10. 【保存退出】保存并退出

   ```bash
   在命令模式下输入 :wq 然后回车
   ```

11. 【保存退出】保存并退出（等效写法）

   ```bash
   在命令模式下输入 :x 然后回车
   ```

12. 【保存退出】不保存强制退出

   ```bash
   在命令模式下输入 :q! 然后回车
   ```

13. 【保存退出】保存所有打开的文件并退出

   ```bash
   在命令模式下输入 :wqa 然后回车
   ```

14. 【保存退出】Normal 模式快捷键保存退出

   ```bash
   在 Normal 模式下按 ZZ（保存退出）或 ZQ（不保存退出）
   ```

15. 【光标移动】上下左右

   ```bash
   h（左）j（下）k（上）l（右）——推荐替代方向键
   ```

16. 【光标移动】跳到文件头 / 文件尾

   ```bash
   gg 跳到开头 / G 跳到末尾
   ```

17. 【光标移动】跳到行首 / 行尾

   ```bash
   0 跳到行首 / $ 跳到行尾 / ^ 跳到第一个非空字符
   ```

18. 【光标移动】按单词移动

   ```bash
   w 下一个单词开头 / b 上一个单词开头 / e 单词结尾
   ```

19. 【光标移动】翻页

   ```bash
   Ctrl+f 下一页 / Ctrl+b 上一页 / Ctrl+d 下半页 / Ctrl+u 上半页
   ```

20. 【编辑操作】删除当前行

   ```bash
   在 Normal 模式下按 dd
   ```

21. 【编辑操作】删除 5 行

   ```bash
   在 Normal 模式下按 5dd
   ```

22. 【编辑操作】删除从光标到行尾

   ```bash
   在 Normal 模式下按 D
   ```

23. 【编辑操作】复制当前行

   ```bash
   在 Normal 模式下按 yy
   ```

24. 【编辑操作】粘贴

   ```bash
   在 Normal 模式下按 p（光标后）或 P（光标前）
   ```

25. 【编辑操作】撤销 / 重做

   ```bash
   u 撤销 / Ctrl+r 重做
   ```

26. 【搜索替换】向下搜索 'error'

   ```bash
   在 Normal 模式下按 /error 然后回车
   ```

27. 【搜索替换】向上搜索

   ```bash
   在 Normal 模式下按 ?error 然后回车
   ```

28. 【搜索替换】跳到下一个 / 上一个匹配

   ```bash
   n 下一个 / N 上一个
   ```

29. 【搜索替换】全局替换（不确认）

   ```bash
   在命令模式下 :%s/old/new/g
   ```

30. 【搜索替换】全局替换（逐个确认）

   ```bash
   在命令模式下 :%s/old/new/gc
   ```

31. 【搜索替换】替换当前行第一个匹配

   ```bash
   在命令模式下 :s/old/new/
   ```

32. 【搜索替换】指定行范围替换（10-20 行）

   ```bash
   在命令模式下 :10,20s/foo/bar/g
   ```

33. 【查看日志】用 vim 打开大日志并跳到末尾

   ```bash
   vim + app.log
   ```

34. 【查看日志】打开日志直接搜索 ERROR

   ```bash
   vim +/ERROR /var/log/syslog
   ```

35. 【查看日志】在 vim 内高亮显示某关键字

   ```bash
   在命令模式下 :set hlsearch 然后 /keyword
   ```

36. 【查看日志】关闭高亮

   ```bash
   在命令模式下 :nohlsearch（或简写 :noh）
   ```

37. 【查看日志】显示行号方便定位

   ```bash
   在命令模式下 :set number（或 :set nu）
   ```

38. 【查看日志】vim 内执行 grep 过滤结果到 quickfix 窗口

   ```bash
   在命令模式下 :grep ERROR % 然后 :copen 查看结果列表
   ```

39. 【查看日志】跳转到特定行（如第 5000 行）

   ```bash
   在命令模式下 :5000 然后回车
   ```

40. 【查看日志】折叠/展开可视区域

   ```bash
   zf 创建折叠 / zo 打开折叠 / zc 关闭折叠
   ```

41. 【分屏操作】水平分屏

   ```bash
   在命令模式下 :split（或 :sp）
   ```

42. 【分屏操作】垂直分屏

   ```bash
   在命令模式下 :vsplit（或 :vsp）
   ```

43. 【分屏操作】在分屏间切换

   ```bash
   Ctrl+w 然后按 h/j/k/l 切换到对应方向的分屏
   ```

44. 【分屏操作】关闭当前分屏

   ```bash
   在命令模式下 :q
   ```

**相关命令：** `vi`、`nano`、`emacs`、`neovim`、`sed`、`awk`、`cat`、`less`、`tail`、`grep`

**标签：** 编辑、编辑器、文本、vim、vi、修改、文件、编写、代码、配置、日志

---

**wc**　`低危`

> 统计文件的行数、单词数和字节数

**语法：**

```bash
wc [选项] [文件...]
```

**常用参数：**
- `-l`：只显示行数
- `-w`：只显示单词数
- `-c`：只显示字节数
- `-m`：只显示字符数

**示例：**

1. 统计文件行数

   ```bash
   wc -l file.txt
   ```

2. 统计文件字数

   ```bash
   wc -w essay.txt
   ```

3. 统计目录下文件数量

   ```bash
   ls | wc -l
   ```

4. 统计代码行数

   ```bash
   find . -name "*.js" | xargs wc -l
   ```

**相关命令：** `du`、`cat`、`awk`

**标签：** 统计、行数、单词、计数、数量、字数、大小

---

#### 用户权限

**chage**　`中危`

> 管理用户密码过期策略

**语法：**

```bash
chage [选项] 用户名
```

**常用参数：**
- `-l`：显示密码过期信息
- `-M`：密码最大有效天数
- `-E`：账户过期日期（YYYY-MM-DD）

**示例：**

1. 查看密码过期信息

   ```bash
   chage -l username
   ```

2. 设置密码 90 天后过期

   ```bash
   sudo chage -M 90 username
   ```

3. 设置账户过期日期

   ```bash
   sudo chage -E 2026-12-31 username
   ```

**相关命令：** `passwd`、`usermod`、`useradd`

**标签：** 密码、过期、策略、用户、安全

---

**chgrp**　`中危`

> 修改文件或目录的所属组

**语法：**

```bash
chgrp [选项] 组 文件...
```

**常用参数：**
- `-R`：递归修改目录及其内容

**示例：**

1. 修改文件所属组

   ```bash
   chgrp developers file.txt
   ```

2. 递归修改目录组

   ```bash
   chgrp -R www-data /var/www
   ```

**相关命令：** `chown`、`chmod`、`groups`

**标签：** 组、修改、文件、所有者、权限、归属

---

**chmod**　`高危`

> 修改文件或目录的权限

**语法：**

```bash
chmod [选项] 模式 文件...
```

**常用参数：**
- `-R`：递归修改目录及其内容
- `-v`：显示修改过程

**示例：**

1. 给文件添加执行权限

   ```bash
   chmod +x script.sh
   ```

2. 设置为 rwxr-xr-x（755）

   ```bash
   chmod 755 file
   ```

3. 递归修改目录下所有文件为 644

   ```bash
   chmod -R 644 /var/www
   ```

4. 给所有用户只读权限

   ```bash
   chmod a=r file.txt
   ```

**相关命令：** `chown`、`umask`、`ls`

**标签：** 权限、修改、授权、文件、目录、读写、执行

---

**chown**　`高危`

> 修改文件或目录的所属用户和组

**语法：**

```bash
chown [选项] 用户[:组] 文件...
```

**常用参数：**
- `-R`：递归修改目录及其内容
- `-v`：显示修改过程

**示例：**

1. 修改文件所有者

   ```bash
   sudo chown user1 file.txt
   ```

2. 修改文件所有者和组

   ```bash
   sudo chown user1:group1 file.txt
   ```

3. 递归修改目录所有者和组

   ```bash
   sudo chown -R www-data:www-data /var/www
   ```

**相关命令：** `chmod`、`chgrp`、`useradd`

**标签：** 所有者、组、用户、权限、文件、归属

---

**groups**　`低危`

> 显示用户所属的用户组

**语法：**

```bash
groups [用户名]
```

**示例：**

1. 查看当前用户所属组

   ```bash
   groups
   ```

2. 查看指定用户所属组

   ```bash
   groups username
   ```

**相关命令：** `id`、`whoami`、`usermod`

**标签：** 组、用户、查看、权限

---

**last**　`低危`

> 显示用户登录历史记录

**语法：**

```bash
last [选项] [用户名]
```

**常用参数：**
- `-n`：显示最后 N 条记录
- `-f`：指定日志文件

**示例：**

1. 查看登录历史

   ```bash
   last
   ```

2. 查看最后 10 条登录

   ```bash
   last -10
   ```

3. 查看指定用户登录历史

   ```bash
   last username
   ```

**相关命令：** `lastb`、`lastlog`、`who`、`w`

**标签：** 登录、历史、用户、审计、查看、记录

---

**passwd**　`中危`

> 修改用户密码

**语法：**

```bash
passwd [选项] [用户名]
```

**常用参数：**
- `-l`：锁定用户账户
- `-u`：解锁用户账户
- `-d`：删除密码（无密码登录）
- `-e`：强制用户下次登录时修改密码

**示例：**

1. 修改当前用户密码

   ```bash
   passwd
   ```

2. 修改指定用户密码

   ```bash
   sudo passwd username
   ```

3. 锁定用户账户

   ```bash
   sudo passwd -l username
   ```

**相关命令：** `useradd`、`usermod`、`chage`

**标签：** 密码、修改、设置、用户、账户

---

**su**　`高危`

> 切换用户身份（默认切换到 root）

**语法：**

```bash
su [选项] [用户名]
```

**常用参数：**
- `-`：启动登录 shell（加载目标用户环境）
- `-c`：以目标用户执行命令后退出

**示例：**

1. 切换到 root

   ```bash
   su -
   ```

2. 切换到指定用户

   ```bash
   su - username
   ```

3. 以 root 执行单条命令

   ```bash
   su -c 'systemctl restart nginx'
   ```

**相关命令：** `sudo`、`login`、`runuser`

**标签：** 切换、用户、root、管理员、身份

---

**sudo**　`高危`

> 以超级用户或其他用户身份执行命令

**语法：**

```bash
sudo [选项] 命令
```

**常用参数：**
- `-u`：以指定用户身份执行
- `-i`：以目标用户身份启动登录 shell
- `-l`：列出当前用户可执行的命令

**示例：**

1. 以 root 身份执行命令

   ```bash
   sudo apt update
   ```

2. 以指定用户身份执行命令

   ```bash
   sudo -u postgres psql
   ```

3. 切换到 root 用户

   ```bash
   sudo -i
   ```

4. 查看可执行的 sudo 命令

   ```bash
   sudo -l
   ```

**相关命令：** `su`、`visudo`、`pkexec`

**标签：** 超级、管理员、权限、root、提权、执行

---

**useradd**　`高危`

> 创建新用户账户

**语法：**

```bash
useradd [选项] 用户名
```

**常用参数：**
- `-m`：自动创建用户主目录
- `-s`：指定用户的默认 shell
- `-g`：指定主组
- `-G`：指定附加组

**示例：**

1. 创建用户并生成主目录

   ```bash
   sudo useradd -m newuser
   ```

2. 创建用户并指定 shell

   ```bash
   sudo useradd -m -s /bin/bash newuser
   ```

3. 创建用户并加入附加组

   ```bash
   sudo useradd -m -G sudo,docker newuser
   ```

**相关命令：** `userdel`、`usermod`、`passwd`、`adduser`

**标签：** 创建、用户、账户、添加、新建

---

**userdel**　`高危`

> 删除用户账户

**语法：**

```bash
userdel [选项] 用户名
```

**常用参数：**
- `-r`：同时删除用户主目录和邮件
- `-f`：强制删除（即使用户已登录）

**示例：**

1. 删除用户（保留主目录）

   ```bash
   sudo userdel username
   ```

2. 删除用户及主目录

   ```bash
   sudo userdel -r username
   ```

**相关命令：** `useradd`、`usermod`、`rm`

**标签：** 删除、用户、账户、移除

---

**usermod**　`高危`

> 修改已有用户账户的属性

**语法：**

```bash
usermod [选项] 用户名
```

**常用参数：**
- `-aG`：将用户追加到附加组
- `-s`：修改用户的默认 shell
- `-l`：修改用户名
- `-L`：锁定用户账户
- `-U`：解锁用户账户

**示例：**

1. 将用户添加到 sudo 组

   ```bash
   sudo usermod -aG sudo username
   ```

2. 修改用户的默认 shell

   ```bash
   sudo usermod -s /bin/zsh username
   ```

3. 锁定用户

   ```bash
   sudo usermod -L username
   ```

**相关命令：** `useradd`、`userdel`、`passwd`、`groupadd`

**标签：** 修改、用户、账户、组、shell

---

**who**　`低危`

> 显示当前登录系统的用户

**语法：**

```bash
who [选项]
```

**常用参数：**
- `-b`：显示系统最近启动时间
- `-r`：显示当前运行级别

**示例：**

1. 查看当前登录用户

   ```bash
   who
   ```

2. 查看系统启动时间

   ```bash
   who -b
   ```

3. 查看自己是谁

   ```bash
   whoami
   ```

**相关命令：** `whoami`、`w`、`last`、`users`

**标签：** 登录、用户、查看、在线、当前

---

### 配方（20 个）

#### 📋 配方 · 查找并删除文件

**查找并删除文件**

> 递归查找匹配模式的文件并批量删除，常用于清理日志或临时文件

**一键执行：**

```bash
find . -name '*.log' -type f | xargs rm -f
```

**步骤拆解：**

1. 在当前目录递归查找所有 .log 后缀的普通文件

   ```bash
   find . -name '*.log' -type f
   ```

2. 将文件列表通过管道传给 xargs，逐一执行 rm -f 删除

   ```bash
   xargs rm -f
   ```

**标签：** 查找、删除、文件、管道、批量、清理

---

#### 📋 配方 · 搜索并统计出现次数

**搜索并统计出现次数**

> 在文件中搜索指定关键词，排序后统计每个匹配行出现的频率——经典日志分析组合

**一键执行：**

```bash
grep 'ERROR' app.log | sort | uniq -c | sort -rn
```

**步骤拆解：**

1. 从日志中筛选出含 ERROR 的行

   ```bash
   grep 'ERROR' app.log
   ```

2. 排序，使相同行相邻（uniq 要求）

   ```bash
   sort
   ```

3. 去重并统计每行出现次数

   ```bash
   uniq -c
   ```

4. 按出现次数逆序排列，最多的排最前

   ```bash
   sort -rn
   ```

**标签：** 搜索、统计、日志、排序、管道、分析、数据处理

---

#### 📋 配方 · 查找大文件并排序

**查找大文件并排序**

> 找出目录下占用空间最大的几个文件或目录，快速定位磁盘空间被什么占用

**一键执行：**

```bash
du -sh * | sort -rh | head -10
```

**步骤拆解：**

1. 计算当前目录下每个文件/子目录的大小（人类可读格式）

   ```bash
   du -sh *
   ```

2. 按人类可读的大小逆序排列（大到小）

   ```bash
   sort -rh
   ```

3. 只取前 10 行，即最大的 10 个

   ```bash
   head -10
   ```

**标签：** 磁盘、文件、大小、排序、管道、空间

---

#### 📋 配方 · 查找并替换文本

**查找并替换文本**

> 递归查找文件中的指定文本并替换，sed 与 find 的经典配合

**一键执行：**

```bash
find . -type f -name '*.txt' -exec sed -i 's/old/new/g' {} +
```

**步骤拆解：**

1. 递归查找所有 .txt 文件

   ```bash
   find . -type f -name '*.txt'
   ```

2. 对每个文件执行 sed 全局替换：old → new

   ```bash
   -exec sed -i 's/old/new/g' {} +
   ```

**标签：** 查找、替换、文件、文本、批量

---

#### 📋 配方 · 查找占用端口的进程并杀死

**查找占用端口的进程并杀死**

> 找到占用指定端口的进程 PID 并强制终止

**一键执行：**

```bash
lsof -i :8080 | awk 'NR>1{print $2}' | xargs kill -9
```

**步骤拆解：**

1. 列出占用 8080 端口的进程信息

   ```bash
   lsof -i :8080
   ```

2. 跳过表头，提取第二列的 PID

   ```bash
   awk 'NR>1{print $2}'
   ```

3. 将 PID 传给 kill -9 强制终止

   ```bash
   xargs kill -9
   ```

**标签：** 进程、端口、网络、管道、杀死、查找

---

#### 📋 配方 · 查看网络连接状态分布

**查看网络连接状态分布**

> 统计当前系统 TCP 连接在各状态（LISTEN/ESTABLISHED/TIME_WAIT 等）的分布，快速判断是否有连接堆积

**一键执行：**

```bash
ss -tan | awk 'NR>1{print $1}' | sort | uniq -c | sort -rn
```

**步骤拆解：**

1. 列出所有 TCP 连接（不解析服务名，加速输出）

   ```bash
   ss -tan
   ```

2. 跳过表头，提取第一列（连接状态）

   ```bash
   awk 'NR>1{print $1}'
   ```

3. 排序使相同状态相邻

   ```bash
   sort
   ```

4. 去重统计每种状态的出现次数

   ```bash
   uniq -c
   ```

5. 按出现次数降序排列

   ```bash
   sort -rn
   ```

**标签：** 网络、连接、统计、TCP、排查、管道、socket

---

#### 📋 配方 · 查找最近修改的文件

**查找最近修改的文件**

> 找出当前目录下最近 7 天内修改过的文件，按修改时间从新到旧排列，只看前 10 个

**一键执行：**

```bash
find . -type f -mtime -7 -printf '%T@ %p\n' | sort -rn | head -10 | cut -d' ' -f2-
```

**步骤拆解：**

1. 查找最近 7 天内修改的普通文件，输出时间戳+路径

   ```bash
   find . -type f -mtime -7 -printf '%T@ %p\n'
   ```

2. 按时间戳逆序排列（最新的在前）

   ```bash
   sort -rn
   ```

3. 取前 10 行

   ```bash
   head -10
   ```

4. 去掉时间戳，只保留文件路径

   ```bash
   cut -d' ' -f2-
   ```

**标签：** 查找、文件、修改、时间、管道、最近、排序

---

#### 📋 配方 · 统计目录下文件类型分布

**统计目录下文件类型分布**

> 查看某个目录下各种文件扩展名的数量分布，结果从多到少排列

**一键执行：**

```bash
find . -type f -name '*.*' | sed 's/.*\.//' | sort | uniq -c | sort -rn | head -10
```

**步骤拆解：**

1. 递归查找所有带扩展名的文件

   ```bash
   find . -type f -name '*.*'
   ```

2. 提取文件扩展名（最后一个 . 之后的内容）

   ```bash
   sed 's/.*\.//'
   ```

3. 排序使相同类型相邻

   ```bash
   sort
   ```

4. 去重并统计每种扩展名的数量

   ```bash
   uniq -c
   ```

5. 按数量降序排列，取 Top 10

   ```bash
   sort -rn | head -10
   ```

**标签：** 统计、文件、类型、目录、管道、分析

---

#### 📋 配方 · 批量杀死匹配进程

**批量杀死匹配进程**

> 根据关键词查找匹配的进程并批量终止，适用于清理僵尸进程或停止某类服务

**一键执行：**

```bash
ps aux | grep 'PATTERN' | grep -v grep | awk '{print $2}' | xargs kill
```

**步骤拆解：**

1. 列出所有进程

   ```bash
   ps aux
   ```

2. 筛选含关键词的进程（将 PATTERN 替换为实际关键词）

   ```bash
   grep 'PATTERN'
   ```

3. 排除 grep 自身进程

   ```bash
   grep -v grep
   ```

4. 提取进程 PID（第二列）

   ```bash
   awk '{print $2}'
   ```

5. 将 PID 传给 kill 命令逐一终止

   ```bash
   xargs kill
   ```

**标签：** 进程、杀死、批量、管道、查找、终止

---

#### 📋 配方 · 日志分析—找出 404 最多的 URL

**日志分析—找出 404 最多的 URL**

> 分析 Nginx/Apache 访问日志，统计返回 404 的 URL 并找出访问失败次数最多的页面

**一键执行：**

```bash
awk '$9==404{print $7}' access.log | sort | uniq -c | sort -rn | head -10
```

**步骤拆解：**

1. 筛选 HTTP 状态码为 404 的行，输出请求 URL（第 7 列）

   ```bash
   awk '$9==404{print $7}' access.log
   ```

2. 排序使相同 URL 相邻

   ```bash
   sort
   ```

3. 去重并统计每个 URL 的 404 次数

   ```bash
   uniq -c
   ```

4. 按出现次数降序排列

   ```bash
   sort -rn
   ```

5. 取前 10 条记录

   ```bash
   head -10
   ```

**标签：** 日志、分析、404、Nginx、Apache、统计、管道、Web

---

#### 📋 配方 · 系统信息全面采集

**系统信息全面采集**

> 一次性获取系统核心信息：内核版本、CPU、内存、磁盘、网络等

**一键执行：**

```bash
uname -a && cat /etc/os-release && free -h && df -h && ip addr
```

**步骤拆解：**

1. 查看内核版本与架构

   ```bash
   uname -a
   ```

2. 查看发行版信息

   ```bash
   cat /etc/os-release
   ```

3. 查看内存使用情况（人类可读）

   ```bash
   free -h
   ```

4. 查看磁盘使用情况

   ```bash
   df -h
   ```

5. 查看网络接口与 IP 地址

   ```bash
   ip addr
   ```

**标签：** 系统、信息、内存、磁盘、网络、诊断、组合

---

#### 📋 配方 · 批量修改文件权限

**批量修改文件权限**

> 递归设置目录为 755、文件为 644，确保 Web 项目权限正确

**一键执行：**

```bash
find /var/www -type d -exec chmod 755 {} + && find /var/www -type f -exec chmod 644 {} +
```

**步骤拆解：**

1. 递归查找所有目录并设为 755

   ```bash
   find /var/www -type d -exec chmod 755 {} +
   ```

2. 递归查找所有文件并设为 644

   ```bash
   find /var/www -type f -exec chmod 644 {} +
   ```

**标签：** 权限、文件、目录、批量、Web、组合、安全

---

#### 📋 配方 · 压缩与归档一条龙

**压缩与归档一条龙**

> 将目录打包压缩为 tar.gz，一步到位，适合备份和传输

**一键执行：**

```bash
tar -czvf archive.tar.gz /path/to/dir
```

**步骤拆解：**

1. 创建归档（c）、gzip 压缩（z）、显示过程（v）、指定文件名（f）

   ```bash
   tar -czvf archive.tar.gz /path/to/dir
   ```

**标签：** 压缩、打包、备份、归档、文件

---

#### 📋 配方 · 监控 CPU/内存 Top 进程

**监控 CPU/内存 Top 进程**

> 持续监控系统中消耗 CPU 或内存最多的进程

**一键执行：**

```bash
ps aux --sort=-%cpu | head -10
```

**步骤拆解：**

1. 列出所有进程并按 CPU 使用率降序排列

   ```bash
   ps aux --sort=-%cpu
   ```

2. 只取前 10 行（表头 + Top 9）

   ```bash
   head -10
   ```

**标签：** 进程、CPU、监控、性能、排序、管道

---

#### 📋 配方 · 递归统计代码行数

**递归统计代码行数**

> 统计项目中所有源码文件的总行数

**一键执行：**

```bash
find . -name '*.js' -o -name '*.ts' -o -name '*.vue' | xargs wc -l | tail -1
```

**步骤拆解：**

1. 查找所有 JS/TS/Vue 源码文件

   ```bash
   find . -name '*.js' -o -name '*.ts' -o -name '*.vue'
   ```

2. 对每个文件统计行数

   ```bash
   xargs wc -l
   ```

3. 只取最后一行——总行数汇总

   ```bash
   tail -1
   ```

**标签：** 统计、代码、文件、查找、管道、开发

---

#### 📋 配方 · SSH 免密登录一条龙

**SSH 免密登录一条龙**

> 生成 RSA 4096 位密钥并自动上传到目标服务器，之后即可免密登录

**一键执行：**

```bash
ssh-keygen -t rsa -b 4096 && ssh-copy-id user@host
```

**步骤拆解：**

1. 生成 4096 位 RSA 密钥对（按提示回车使用默认路径，可设密码或留空）

   ```bash
   ssh-keygen -t rsa -b 4096
   ```

2. 将公钥复制到目标服务器（将 user@host 替换为实际用户名和主机）

   ```bash
   ssh-copy-id user@host
   ```

**标签：** SSH、密钥、登录、安全、免密、远程

---

#### 📋 配方 · 备份并远程传输

**备份并远程传输**

> 将本地目录打包压缩，通过 SSH 管道直接写到远程服务器，不占用本地磁盘空间

**一键执行：**

```bash
tar -czf - /path/to/dir | ssh user@host 'cat > backup_$(date +%Y%m%d).tar.gz'
```

**步骤拆解：**

1. 打包压缩目录，输出到 stdout（-f - 表示标准输出）

   ```bash
   tar -czf - /path/to/dir
   ```

2. 通过 SSH 在远程服务器上写入带日期的备份文件

   ```bash
   ssh user@host 'cat > backup_$(date +%Y%m%d).tar.gz'
   ```

**标签：** 备份、远程、SSH、压缩、传输、tar

---

#### 📋 配方 · 一键系统快照报告

**一键系统快照报告**

> 一次性采集系统核心信息（CPU/内存/磁盘/网络/运行时间）并写入报告文件

**一键执行：**

```bash
{ echo '=== CPU ==='; lscpu | head -6; echo; echo '=== 内存 ==='; free -h; echo; echo '=== 磁盘 ==='; df -h; echo; echo '=== 网络 ==='; ip -br addr; echo; echo '=== 运行时间 ==='; uptime; } | tee system_snapshot.txt
```

**步骤拆解：**

1. 打印 CPU 信息的前 6 行（型号、核数等）

   ```bash
   lscpu | head -6
   ```

2. 查看内存使用情况（人类可读）

   ```bash
   free -h
   ```

3. 查看磁盘挂载和使用情况

   ```bash
   df -h
   ```

4. 查看网络接口简要信息

   ```bash
   ip -br addr
   ```

5. 查看系统负载和运行时间

   ```bash
   uptime
   ```

6. 将全部输出同时保存到文件和打印到屏幕

   ```bash
   tee system_snapshot.txt
   ```

**标签：** 系统、报告、诊断、快照、CPU、内存、磁盘、网络

---

#### 📋 配方 · 查看内存占用 Top 进程

**查看内存占用 Top 进程**

> 快速找出消耗内存最多的前 10 个进程，排查内存泄漏或资源瓶颈

**一键执行：**

```bash
ps aux --sort=-%mem | head -11
```

**步骤拆解：**

1. 列出所有进程并按内存占用率降序排列

   ```bash
   ps aux --sort=-%mem
   ```

2. 取前 11 行（1 行表头 + Top 10 进程）

   ```bash
   head -11
   ```

**标签：** 进程、内存、性能、监控、Top、管道

---

#### 📋 配方 · 递归比较两个目录差异

**递归比较两个目录差异**

> 对比两个目录的内容差异并生成 patch 文件，常用于版本对比或代码审查

**一键执行：**

```bash
diff -ruN dir-v1/ dir-v2/ > changes.patch
```

**步骤拆解：**

1. 递归（-r）比较两个目录，统一格式（-u）输出差异，将不存在的文件视为空（-N）

   ```bash
   diff -ruN dir-v1/ dir-v2/
   ```

2. 将差异输出重定向到 patch 文件

   ```bash
   > changes.patch
   ```

3. 之后可以在 dir-v1 中执行 patch -p1 < changes.patch 应用变更

   ```bash
   # 应用补丁: cd dir-v1 && patch -p1 < ../changes.patch
   ```

**标签：** 比较、目录、差异、diff、patch、版本、补丁

---

---

## 🔴 Redis

### 命令（103 条）

#### connection

**redis-cli**　`中危`

> Redis 命令行客户端，用于连接 Redis 服务器并执行命令。支持交互模式、批量模式、管道模式等多种使用方式

**语法：**

```redis
redis-cli [OPTIONS] [cmd [arg [arg ...]]]
```

**常用参数：**
- `-h <host>`：Redis 服务器主机地址（默认 127.0.0.1）
- `-p <port>`：Redis 服务器端口（默认 6379）
- `-a <password>`：认证密码（命令行明文传递，不安全）
- `-n <db>`：选择数据库编号（默认 0）
- `-u <uri>`：以 URI 格式指定连接：redis://user:pass@host:port/db
- `--tls`：启用 TLS/SSL 加密连接
- `--cacert <file>`：TLS 连接的 CA 证书文件路径
- `-c`：启用集群模式（自动重定向到正确的节点）
- `-r <n>`：重复执行命令 n 次（配合 -i 使用）
- `-i <interval>`：每次命令执行间隔秒数（配合 -r 使用）
- `--no-auth-warning`：屏蔽命令行传密码的安全警告
- `--raw`：原样输出（不格式化中文/换行等特殊字符）
- `--no-raw`：显示原始字节（调试用）
- `--csv`：以 CSV 格式输出结果
- `--stat`：实时打印 Redis 服务器统计信息
- `--bigkeys`：扫描数据库中占用空间最大的 key（生产慎用）
- `--memkeys`：扫描数据库中内存占用最大的 key
- `--hotkeys`：扫描最频繁访问的 key（需 maxmemory-policy=LFU）
- `--latency`：测量 Redis 服务器延迟
- `--latency-history`：持续记录延迟变化历史
- `--scan`：扫描所有 key 的类型和大小
- `--pipe`：管道模式：从 stdin 读取命令批量发送（极速导入数据）
- `--eval <file>`：执行 Lua 脚本文件
- `--rdb <file>`：解析并导出 RDB 文件内容
- `-v`：显示版本信息
- `--help`：显示帮助信息

**示例：**

1. 连接本地 Redis 并进入交互模式

   ```redis
   redis-cli
   ```

2. 连接远程 Redis 服务器（指定主机和端口）

   ```redis
   redis-cli -h 192.168.1.100 -p 6380
   ```

3. 带密码认证连接

   ```redis
   redis-cli -a 'myStrongPassword'
   ```

4. 使用 URI 方式连接（推荐，避免密码泄漏到 shell 历史）

   ```redis
   redis-cli -u redis://:password@host:6379/0
   ```

5. 连接后直接执行单条命令，输出结果后退出

   ```redis
   redis-cli PING
   ```

6. 选择 2 号数据库并获取 key 的值

   ```redis
   redis-cli -n 2 GET user:1:name
   ```

7. 集群模式连接（自动跟随 MOVED 重定向）

   ```redis
   redis-cli -c -h cluster-node1 -p 7000
   ```

8. TLS 加密连接（Redis 6+ 生产推荐）

   ```redis
   redis-cli --tls --cacert /etc/redis/ca.crt -h redis.example.com
   ```

9. 管道模式批量导入数据（极速，适合数据迁移）

   ```redis
   cat commands.txt | redis-cli --pipe
   ```

10. 每隔 2 秒重复执行 INFO server，用于监控

   ```redis
   redis-cli -r 10 -i 2 INFO server
   ```

11. 实时监控模式：持续打印 Redis 每秒处理的命令数、内存等

   ```redis
   redis-cli --stat
   ```

12. 扫描大 key（找出占用最多的 key）

   ```redis
   redis-cli --bigkeys
   ```

13. 测量服务器响应延迟

   ```redis
   redis-cli --latency
   ```

14. 延迟历史记录（连续采样 30 秒）

   ```redis
   redis-cli --latency-history
   ```

15. 执行外部 Lua 脚本文件

   ```redis
   redis-cli --eval /path/to/script.lua key1 key2 , arg1 arg2
   ```

16. CSV 格式输出（适合脚本解析）

   ```redis
   redis-cli --csv KEYS 'user:*'
   ```

17. 列出所有以 user: 开头的 key（原生格式）

   ```redis
   redis-cli KEYS 'user:*'
   ```

18. 从标准输入读取命令交互执行（脚本中常用）

   ```redis
   echo 'GET user:1:name' | redis-cli
   ```

**相关命令：** `redis-server`、`MONITOR`、`INFO`、`PING`

**标签：** 连接、客户端、终端、命令行、登录、Shell、交互、工具

---

#### hash

**HDEL**　`中危`

> 删除哈希表中的一个或多个指定字段

**语法：**

```redis
HDEL key field [field ...]
```

**示例：**

1. 删除用户的 age 字段

   ```redis
   HDEL user:1 age
   ```

**相关命令：** `HSET`、`HGET`、`HEXISTS`

**标签：** 删除、哈希、字段、移除

---

**HEXISTS**　`低危`

> 检查哈希表中指定字段是否存在

**语法：**

```redis
HEXISTS key field
```

**示例：**

1. 检查用户是否有 email 字段

   ```redis
   HEXISTS user:1 email
   ```

**相关命令：** `HSET`、`HGET`

**标签：** 存在、哈希、字段、检查、判断

---

**HGET**　`低危`

> 获取哈希表中指定字段的值

**语法：**

```redis
HGET key field
```

**示例：**

1. 获取用户姓名

   ```redis
   HGET user:1 name
   ```

**相关命令：** `HSET`、`HMGET`、`HGETALL`

**标签：** 获取、读取、哈希、字段、查询

---

**HGETALL**　`低危`

> 获取哈希表中所有的字段和值

**语法：**

```redis
HGETALL key
```

**示例：**

1. 获取用户完整信息

   ```redis
   HGETALL user:1
   ```

**相关命令：** `HSET`、`HGET`、`HMGET`

**标签：** 获取、全部、哈希、遍历、查询

---

**HINCRBY**　`低危`

> 为哈希表中的指定字段值增加整数增量（原子操作，字段不存在则初始化为 0）

**语法：**

```redis
HINCRBY key field increment
```

**示例：**

1. 文章阅读量 +1

   ```redis
   HINCRBY article:1001 views 1
   ```

2. 扣减库存

   ```redis
   HINCRBY product:sku001 stock -10
   ```

**相关命令：** `HINCRBYFLOAT`、`HSET`、`HGET`、`INCRBY`

**标签：** 递增、计数器、哈希、原子、数字

---

**HKEYS**　`低危`

> 获取哈希表中所有的字段名（field names）

**语法：**

```redis
HKEYS key
```

**示例：**

1. 查看用户对象有哪些属性字段

   ```redis
   HKEYS user:1
   ```

**相关命令：** `HVALS`、`HGETALL`、`HLEN`、`HSCAN`

**标签：** 字段名、哈希、键名、遍历、查询

---

**HLEN**　`低危`

> 获取哈希表中字段的数量

**语法：**

```redis
HLEN key
```

**示例：**

1. 获取用户信息字段数量

   ```redis
   HLEN user:1
   ```

**相关命令：** `HSET`、`HGETALL`

**标签：** 长度、哈希、字段数量、统计

---

**HSET**　`低危`

> 将哈希表 key 中的字段设为指定值

**语法：**

```redis
HSET key field value [field value ...]
```

**示例：**

1. 设置用户信息

   ```redis
   HSET user:1 name Alice age 25 city Beijing
   ```

**相关命令：** `HGET`、`HGETALL`、`HDEL`

**标签：** 设置、写入、哈希、字段、对象

---

**HVALS**　`低危`

> 获取哈希表中所有的值（values），不包含字段名

**语法：**

```redis
HVALS key
```

**示例：**

1. 查看用户对象的所有属性值

   ```redis
   HVALS user:1
   ```

**相关命令：** `HKEYS`、`HGETALL`、`HLEN`、`HSCAN`

**标签：** 值、哈希、遍历、查询

---

#### key

**COPY**　`低危`

> 将 key 的值复制到新 key（Redis 6.2+），支持 REPLACE 选项覆盖已存在的目标 key，原子操作无需 GET+SET 两步

**语法：**

```redis
COPY source destination [DB dest-db] [REPLACE]
```

**常用参数：**
- `REPLACE`：如果目标 key 已存在则覆盖

**示例：**

1. 快速克隆一个 key 的值

   ```redis
   COPY user:1:profile user:1:profile-backup
   ```

2. 覆盖式复制

   ```redis
   COPY session:abc session:current REPLACE
   ```

**相关命令：** `DUMP`、`RESTORE`、`RENAME`、`MOVE`

**标签：** 复制、克隆、备份、原子

---

**DEL**　`高危`

> 删除一个或多个 key

**语法：**

```redis
DEL key [key ...]
```

**示例：**

1. 删除单个 key

   ```redis
   DEL user:1:cache
   ```

2. 批量删除 key

   ```redis
   DEL user:1:name user:1:age user:1:email
   ```

**相关命令：** `EXISTS`、`UNLINK`、`EXPIRE`

**标签：** 删除、移除、销毁、清理、危险

---

**EXISTS**　`低危`

> 检查一个或多个 key 是否存在

**语法：**

```redis
EXISTS key [key ...]
```

**示例：**

1. 检查 key 是否存在

   ```redis
   EXISTS user:1:name
   ```

**相关命令：** `DEL`、`TYPE`

**标签：** 存在、判断、检查

---

**EXPIRE**　`低危`

> 为 key 设置过期时间（秒）

**语法：**

```redis
EXPIRE key seconds [NX|XX|GT|LT]
```

**示例：**

1. 设置缓存 1 小时后过期

   ```redis
   EXPIRE user:1:cache 3600
   ```

**相关命令：** `TTL`、`PERSIST`、`EXPIREAT`

**标签：** 过期、TTL、超时、自动删除、缓存策略

---

**KEYS**　`高危`

> 查找所有匹配给定模式的 key（生产慎用）

**语法：**

```redis
KEYS pattern
```

**示例：**

1. 查找所有 user 开头的 key

   ```redis
   KEYS user:*
   ```

**相关命令：** `SCAN`、`TYPE`

**标签：** 查找、搜索、模式、匹配、危险、阻塞

---

**PERSIST**　`低危`

> 移除 key 的过期时间，使其永久有效

**语法：**

```redis
PERSIST key
```

**示例：**

1. 取消 key 的过期时间

   ```redis
   PERSIST user:1:cache
   ```

**相关命令：** `EXPIRE`、`TTL`

**标签：** 持久化、永不过期、取消过期

---

**PTTL**　`低危`

> 返回 key 的剩余过期时间，以毫秒为单位——比 TTL 精度更高，用于需要毫秒级精度判断的场景

**语法：**

```redis
PTTL key
```

**示例：**

1. 查看剩余毫秒数

   ```redis
   PTTL session:token-abc
   ```

2. 如果 key 有 2.5 秒过期，TTL 返回 2，PTTL 返回 2500

   ```redis
   SETEX key:demo 3 'hello'
   TTL key:demo   # 返回 2 或 3
   PTTL key:demo  # 返回 2893（精确到毫秒）
   ```

**相关命令：** `TTL`、`EXPIRE`、`PEXPIRE`、`EXPIRETIME`

**标签：** 过期、毫秒、TTL、精度、查询

---

**RENAME**　`高危`

> 将 key 重命名为 newkey（newkey 已存在则先覆盖）

**语法：**

```redis
RENAME key newkey
```

**示例：**

1. 重命名 key

   ```redis
   RENAME old:key:name new:key:name
   ```

**相关命令：** `DEL`、`EXISTS`

**标签：** 重命名、改名、覆盖、危险

---

**SCAN**　`低危`

> 迭代当前数据库中的 key（非阻塞，推荐用于生产）

**语法：**

```redis
SCAN cursor [MATCH pattern] [COUNT count]
```

**示例：**

1. 逐步扫描所有 user:* key

   ```redis
   SCAN 0 MATCH user:* COUNT 100
   ```

**相关命令：** `KEYS`、`TYPE`

**标签：** 扫描、迭代、键、生产安全、游标、分页

---

**SORT**　`低危`

> 对列表、集合或有序集合中的元素排序并返回，支持 BY 模式（按外部 key 排序）、LIMIT、ASC/DESC、ALPHA

**语法：**

```redis
SORT key [BY pattern] [LIMIT offset count] [GET pattern ...] [ASC|DESC] [ALPHA] [STORE destination]
```

**常用参数：**
- `ASC`：升序排列（默认）
- `DESC`：降序排列
- `ALPHA`：按字母序排序而非数字
- `LIMIT offset count`：跳过 offset 条后取 count 条

**示例：**

1. 对列表中的数字降序排列

   ```redis
   LPUSH scores 85 92 78 95
   SORT scores DESC
   ```

2. 分页：跳过前 10 条，取 5 条

   ```redis
   SORT user:list LIMIT 10 5
   ```

**相关命令：** `LRANGE`、`SMEMBERS`、`ZRANGE`、`SCAN`

**标签：** 排序、列表、集合、查询、分页

---

**TTL**　`低危`

> 查看 key 的剩余生存时间（秒）

**语法：**

```redis
TTL key
```

**示例：**

1. 查看缓存还有多久过期（-1=永久，-2=不存在）

   ```redis
   TTL user:1:cache
   ```

**相关命令：** `EXPIRE`、`PERSIST`

**标签：** 过期时间、TTL、查询、剩余时间

---

**TYPE**　`低危`

> 返回 key 所储存的值的类型

**语法：**

```redis
TYPE key
```

**示例：**

1. 查看 key 的数据类型

   ```redis
   TYPE user:1:name
   ```

2. 返回: string/hash/list/set/zset/stream/none

   ```redis
   TYPE unknown_key
   ```

**相关命令：** `DEL`、`EXISTS`

**标签：** 类型、查询、数据结构

---

**UNLINK**　`高危`

> 异步删除 key——与 DEL 类似，但在后台线程中回收内存，不会阻塞主线程。删除大 key 时更安全

**语法：**

```redis
UNLINK key [key ...]
```

**示例：**

1. 异步删除大 key（几百万成员的集合）

   ```redis
   UNLINK cache:big-dataset
   ```

2. 批量异步删除，避免阻塞

   ```redis
   UNLINK session:123 temp:456 cache:789
   ```

**相关命令：** `DEL`、`EXISTS`、`EXPIRE`、`MEMORY`

**标签：** 删除、异步、非阻塞、大Key、清理、危险

---

#### list

**BLPOP**　`低危`

> 阻塞式从列表头部弹出元素——列表为空时阻塞等待直到有元素或超时，避免空轮询

**语法：**

```redis
BLPOP key [key ...] timeout
```

**示例：**

1. 阻塞等待消息，最多等 5 秒

   ```redis
   BLPOP queue:tasks 5
   ```

2. 从多个队列中阻塞弹出（优先级队列）

   ```redis
   BLPOP queue:high queue:normal queue:low 0
   ```

**相关命令：** `BRPOP`、`LPOP`、`LPUSH`、`RPUSH`、`BLMOVE`

**标签：** 阻塞、弹出、队列、消费者、等待、超时

---

**BRPOP**　`低危`

> 阻塞式从列表尾部弹出元素——与 BLPOP 对称，常用于先进先出消息队列消费端

**语法：**

```redis
BRPOP key [key ...] timeout
```

**示例：**

1. FIFO 队列消费——阻塞等待 10 秒

   ```redis
   BRPOP queue:emails 10
   ```

**相关命令：** `BLPOP`、`RPOP`、`LPUSH`、`RPUSH`

**标签：** 阻塞、弹出、队列、消费者、FIFO、超时

---

**LINDEX**　`低危`

> 通过索引获取列表中的元素

**语法：**

```redis
LINDEX key index
```

**示例：**

1. 获取列表第 3 个元素

   ```redis
   LINDEX queue:tasks 2
   ```

**相关命令：** `LRANGE`、`LSET`

**标签：** 索引、列表、查询、位置

---

**LLEN**　`低危`

> 返回列表的长度

**语法：**

```redis
LLEN key
```

**示例：**

1. 查看队列中待处理任务数

   ```redis
   LLEN queue:tasks
   ```

**相关命令：** `LPUSH`、`RPUSH`、`LRANGE`

**标签：** 长度、列表、统计、队列深度

---

**LPOP**　`中危`

> 移除并返回列表的第一个元素

**语法：**

```redis
LPOP key [count]
```

**示例：**

1. 从左侧弹出消息

   ```redis
   LPOP messages:general
   ```

**相关命令：** `LPUSH`、`RPOP`、`LRANGE`

**标签：** 弹出、列表、头部、移除、消费

---

**LPUSH**　`低危`

> 将一个或多个值插入到列表头部

**语法：**

```redis
LPUSH key element [element ...]
```

**示例：**

1. 从左侧推入消息（最新消息在前）

   ```redis
   LPUSH messages:general 'Hello' 'Hi'
   ```

**相关命令：** `RPUSH`、`LPOP`、`LRANGE`、`LLEN`

**标签：** 插入、列表、头部、队列、栈

---

**LRANGE**　`低危`

> 返回列表中指定区间内的元素

**语法：**

```redis
LRANGE key start stop
```

**示例：**

1. 获取列表全部元素

   ```redis
   LRANGE messages:general 0 -1
   ```

2. 获取最新 10 条消息

   ```redis
   LRANGE messages:general 0 9
   ```

**相关命令：** `LPUSH`、`RPUSH`、`LINDEX`

**标签：** 范围、列表、查询、分页、遍历

---

**LREM**　`中危`

> 从列表中移除指定数量的匹配元素——count>0 从头删，count<0 从尾删，count=0 全删

**语法：**

```redis
LREM key count element
```

**示例：**

1. 删除最近一条匹配消息

   ```redis
   LREM messages:pending 1 'spam-message'
   ```

2. 从头部开始删除 2 条匹配记录

   ```redis
   LREM queue:retry 2 'failed-task-42'
   ```

**相关命令：** `LPOP`、`RPOP`、`LTRIM`、`DEL`

**标签：** 删除、移除、列表、匹配、清理

---

**LTRIM**　`中危`

> 裁剪列表，只保留指定区间内的元素——常用于保留最新 N 条记录

**语法：**

```redis
LTRIM key start stop
```

**示例：**

1. 只保留最近 100 条浏览历史

   ```redis
   LTRIM user:1:history 0 99
   ```

2. 只保留最新一条日志（其余全删）

   ```redis
   LTRIM app:recent-logs 0 0
   ```

**相关命令：** `LPUSH`、`RPUSH`、`LRANGE`、`LREM`

**标签：** 裁剪、截断、列表、保留、限制长度、最新

---

**RPOP**　`中危`

> 移除并返回列表的最后一个元素

**语法：**

```redis
RPOP key [count]
```

**示例：**

1. 从队列尾部取出任务

   ```redis
   RPOP queue:tasks
   ```

**相关命令：** `RPUSH`、`LPOP`

**标签：** 弹出、列表、尾部、移除、消费

---

**RPUSH**　`低危`

> 将一个或多个值插入到列表尾部

**语法：**

```redis
RPUSH key element [element ...]
```

**示例：**

1. 从右侧推入任务到队列

   ```redis
   RPUSH queue:tasks 'send_email:123' 'resize_image:456'
   ```

**相关命令：** `LPUSH`、`RPOP`、`LRANGE`、`LLEN`

**标签：** 插入、列表、尾部、队列、追加

---

#### pubsub

**PSUBSCRIBE**　`低危`

> 按模式订阅频道（支持通配符）

**语法：**

```redis
PSUBSCRIBE pattern [pattern ...]
```

**示例：**

1. 订阅所有 news.* 频道

   ```redis
   PSUBSCRIBE news.*
   ```

**相关命令：** `SUBSCRIBE`、`PUBLISH`、`PUNSUBSCRIBE`

**标签：** 订阅、模式匹配、通配符、频道

---

**PUBLISH**　`低危`

> 将消息发布到指定频道

**语法：**

```redis
PUBLISH channel message
```

**示例：**

1. 向 news 频道发布消息

   ```redis
   PUBLISH news 'Breaking: Redis 8.0 released!'
   ```

**相关命令：** `SUBSCRIBE`、`PSUBSCRIBE`、`PUBSUB`

**标签：** 发布、消息、频道、广播、实时

---

**PUBSUB**　`低危`

> 查看发布/订阅系统状态

**语法：**

```redis
PUBSUB subcommand [argument ...]
```

**示例：**

1. 列出当前活跃频道

   ```redis
   PUBSUB CHANNELS
   ```

2. 查看频道订阅者数量

   ```redis
   PUBSUB NUMSUB news
   ```

**相关命令：** `PUBLISH`、`SUBSCRIBE`

**标签：** 查看、频道、订阅统计、诊断

---

**SUBSCRIBE**　`低危`

> 订阅一个或多个频道（进入订阅模式）

**语法：**

```redis
SUBSCRIBE channel [channel ...]
```

**示例：**

1. 订阅 news 和 alerts 频道

   ```redis
   SUBSCRIBE news alerts
   ```

**相关命令：** `PUBLISH`、`PSUBSCRIBE`、`UNSUBSCRIBE`

**标签：** 订阅、消息、频道、实时、监听

---

#### server

**BGSAVE**　`低危`

> 后台异步执行 RDB 快照——fork 子进程写入磁盘，主进程不阻塞，生产环境持久化首选

**语法：**

```redis
BGSAVE [SCHEDULE]
```

**常用参数：**
- `SCHEDULE`：如果有正在进行的 BGSAVE 或 BGREWRITEAOF，则排队等待而非立即执行

**示例：**

1. 后台保存 RDB 快照

   ```redis
   BGSAVE
   ```

**相关命令：** `SAVE`、`LASTSAVE`、`BGREWRITEAOF`、`INFO`

**标签：** 持久化、RDB、后台、异步、快照、备份

---

**CLIENT LIST**　`低危`

> 返回当前所有客户端连接的信息列表——包括 ID、IP、状态、最近命令等，用于排查连接问题和性能分析

**语法：**

```redis
CLIENT LIST [TYPE normal|master|replica|pubsub]
```

**常用参数：**
- `TYPE normal`：只显示普通客户端
- `TYPE pubsub`：只显示发布订阅客户端

**示例：**

1. 查看所有客户端连接

   ```redis
   CLIENT LIST
   ```

2. 查看发布订阅客户端

   ```redis
   CLIENT LIST TYPE pubsub
   ```

**相关命令：** `CLIENT KILL`、`INFO`、`MONITOR`、`CONFIG`

**标签：** 客户端、连接、诊断、排查、运维

---

**CONFIG**　`高危`

> 运行时获取或修改 Redis 配置参数——支持 GET（查看）、SET（修改未持久化）、REWRITE（写入文件）、RESETSTAT（重置统计）

**语法：**

```redis
CONFIG subcommand [argument ...]
```

**常用参数：**
- `CONFIG GET <pattern>`：获取匹配 pattern 的配置项及其值
- `CONFIG SET <key> <value>`：运行时设置配置项（不持久化，重启失效）
- `CONFIG REWRITE`：将当前运行配置写回 redis.conf 文件持久化
- `CONFIG RESETSTAT`：重置 INFO stats 中的统计计数器

**示例：**

1. 查看所有日志相关配置

   ```redis
   CONFIG GET *log*
   ```

2. 运行时修改 maxmemory 为 1GB

   ```redis
   CONFIG SET maxmemory 1073741824
   ```

3. 持久化当前配置到文件

   ```redis
   CONFIG REWRITE
   ```

**相关命令：** `INFO`、`SLOWLOG`、`MEMORY`、`SAVE`

**标签：** 配置、参数、运维、调优、修改、危险

---

**DBSIZE**　`低危`

> 返回当前数据库中 key 的数量——快速了解实例数据规模

**语法：**

```redis
DBSIZE
```

**示例：**

1. 查看当前库有多少个 key

   ```redis
   DBSIZE
   ```

**相关命令：** `INFO`、`FLUSHDB`、`FLUSHALL`、`KEYS`

**标签：** 统计、数量、规模、运维

---

**FLUSHALL**　`极高危`

> 删除 Redis 所有数据库中全部 key——比 FLUSHDB 更彻底，清空整个实例，操作绝对不可逆！

**语法：**

```redis
FLUSHALL [ASYNC|SYNC]
```

**常用参数：**
- `ASYNC`：异步清空——后台线程回收内存，不阻塞（Redis 4.0+）
- `SYNC`：同步清空（默认行为，会阻塞）

**示例：**

1. 清空所有数据库（⚠️生产禁用！）

   ```redis
   FLUSHALL
   ```

2. 异步清空所有库

   ```redis
   FLUSHALL ASYNC
   ```

**相关命令：** `FLUSHDB`、`DEL`、`UNLINK`、`DBSIZE`

**标签：** 清空、全部、危险、不可逆、灾难、谨慎

---

**FLUSHDB**　`极高危`

> 删除当前数据库中所有 key——相当于清空当前库，操作不可逆！

**语法：**

```redis
FLUSHDB [ASYNC|SYNC]
```

**常用参数：**
- `ASYNC`：异步清空——后台线程回收内存，不阻塞（Redis 4.0+）
- `SYNC`：同步清空（默认行为，会阻塞）

**示例：**

1. 清空当前数据库（危险操作！）

   ```redis
   FLUSHDB
   ```

2. 异步清空，避免阻塞

   ```redis
   FLUSHDB ASYNC
   ```

**相关命令：** `FLUSHALL`、`DEL`、`UNLINK`、`DBSIZE`

**标签：** 清空、删除、危险、不可逆、全量、谨慎

---

**INFO**　`低危`

> 返回 Redis 服务器的各种统计信息和状态——包括内存、CPU、客户端、复制、持久化等全面数据

**语法：**

```redis
INFO [section]
```

**常用参数：**
- `server`：服务器常规信息
- `clients`：客户端连接信息
- `memory`：内存使用详情
- `stats`：命令统计和性能计数
- `replication`：主从复制状态
- `cpu`：CPU 消耗统计
- `persistence`：RDB 和 AOF 持久化信息

**示例：**

1. 查看全部信息

   ```redis
   INFO
   ```

2. 只看内存相关

   ```redis
   INFO memory
   ```

3. 查看复制状态

   ```redis
   INFO replication
   ```

**相关命令：** `CONFIG`、`MONITOR`、`SLOWLOG`、`MEMORY`

**标签：** 信息、统计、监控、诊断、状态、运维

---

**LASTSAVE**　`低危`

> 返回最近一次 Redis 成功将数据保存到磁盘的 Unix 时间戳——用于确认备份是否完成

**语法：**

```redis
LASTSAVE
```

**示例：**

1. 查看上次成功持久化的时间

   ```redis
   LASTSAVE
   ```

**相关命令：** `SAVE`、`BGSAVE`、`INFO`、`TIME`

**标签：** 持久化、时间戳、备份、检查、运维

---

**MEMORY**　`低危`

> 内存诊断工具——查看内存使用详情、分析 key 的内存占用、获取优化建议

**语法：**

```redis
MEMORY subcommand [argument ...]
```

**常用参数：**
- `MEMORY USAGE <key> [SAMPLES count]`：估算指定 key 及其值占用的内存字节数
- `MEMORY STATS`：返回内存使用的详细统计信息
- `MEMORY DOCTOR`：输出内存问题诊断报告和优化建议
- `MEMORY MALLOC-STATS`：返回内存分配器内部统计

**示例：**

1. 估算大 key 占用内存

   ```redis
   MEMORY USAGE big:hash:key
   ```

2. 获取内存诊断报告

   ```redis
   MEMORY DOCTOR
   ```

**相关命令：** `INFO`、`CONFIG`、`OBJECT`、`UNLINK`

**标签：** 内存、诊断、优化、分析、运维

---

**MONITOR**　`高危`

> 实时输出 Redis 服务器接收到的每条命令——调试利器，但生产环境慎用（性能开销大）

**语法：**

```redis
MONITOR
```

**示例：**

1. 实时监控所有命令（Ctrl+C 停止）

   ```redis
   MONITOR
   ```

**相关命令：** `SLOWLOG`、`INFO`、`CLIENT LIST`

**标签：** 监控、实时、调试、命令流、诊断、开销大

---

**SAVE**　`高危`

> 同步执行 RDB 快照保存——阻塞 Redis 直到持久化完成，生产环境建议用 BGSAVE 替代

**语法：**

```redis
SAVE
```

**示例：**

1. 立即同步保存（会阻塞直到完成）

   ```redis
   SAVE
   ```

**相关命令：** `BGSAVE`、`LASTSAVE`、`CONFIG`、`INFO`

**标签：** 持久化、RDB、快照、同步、阻塞、备份

---

**SLOWLOG**　`低危`

> 查看和管理慢查询日志——记录执行时间超过 slowlog-log-slower-than 阈值的命令，用于性能排查

**语法：**

```redis
SLOWLOG subcommand [argument]
```

**常用参数：**
- `SLOWLOG GET [count]`：返回最近 count 条慢查询（默认 10），每条含 ID、时间戳、耗时、命令
- `SLOWLOG LEN`：返回当前慢查询日志中的记录数量
- `SLOWLOG RESET`：清空所有慢查询记录

**示例：**

1. 查询最近 10 条慢查询

   ```redis
   SLOWLOG GET 10
   ```

2. 查看慢查询总数

   ```redis
   SLOWLOG LEN
   ```

3. 设置慢查询阈值为 5 毫秒

   ```redis
   CONFIG SET slowlog-log-slower-than 5000
   ```

**相关命令：** `CONFIG`、`INFO`、`MONITOR`、`LATENCY`

**标签：** 慢查询、性能、诊断、日志、排查、优化

---

**TIME**　`低危`

> 返回当前 Redis 服务器的时间——包含 Unix 时间戳（秒）和微秒数

**语法：**

```redis
TIME
```

**示例：**

1. 获取服务器当前时间

   ```redis
   TIME
   # 返回 [1735689600, 123456]（秒 + 微秒）
   ```

**相关命令：** `LASTSAVE`、`INFO`、`EXPIRE`

**标签：** 时间、时间戳、时钟、工具

---

#### set

**SADD**　`低危`

> 向集合中添加一个或多个成员

**语法：**

```redis
SADD key member [member ...]
```

**示例：**

1. 添加用户标签

   ```redis
   SADD user:1:tags vip premium active
   ```

**相关命令：** `SREM`、`SMEMBERS`、`SISMEMBER`、`SCARD`

**标签：** 添加、集合、成员、写入、去重

---

**SCARD**　`低危`

> 返回集合中元素的数量

**语法：**

```redis
SCARD key
```

**示例：**

1. 统计用户标签数量

   ```redis
   SCARD user:1:tags
   ```

**相关命令：** `SADD`、`SMEMBERS`

**标签：** 统计、集合、大小、数量

---

**SDIFF**　`低危`

> 返回第一个集合与其它集合的差集——即存在于第一个集合但不在其他集合中的成员

**语法：**

```redis
SDIFF key [key ...]
```

**示例：**

1. 找出「我可能感兴趣」但还未关注的用户

   ```redis
   SDIFF recommend:users following:me
   ```

**相关命令：** `SINTER`、`SUNION`、`SMEMBERS`、`SDIFFSTORE`

**标签：** 差集、集合、排除、差异、计算

---

**SINTER**　`低危`

> 返回多个集合的交集

**语法：**

```redis
SINTER key [key ...]
```

**示例：**

1. 找出两个用户的共同好友

   ```redis
   SINTER user:1:friends user:2:friends
   ```

**相关命令：** `SUNION`、`SDIFF`、`SADD`

**标签：** 交集、集合、计算、共同好友

---

**SISMEMBER**　`低危`

> 判断 member 元素是否是集合的成员

**语法：**

```redis
SISMEMBER key member
```

**示例：**

1. 检查用户是否有 vip 标签

   ```redis
   SISMEMBER user:1:tags vip
   ```

**相关命令：** `SADD`、`SMEMBERS`

**标签：** 判断、存在、集合、成员、检查

---

**SMEMBERS**　`低危`

> 返回集合中的所有成员

**语法：**

```redis
SMEMBERS key
```

**示例：**

1. 查看用户所有标签

   ```redis
   SMEMBERS user:1:tags
   ```

**相关命令：** `SADD`、`SISMEMBER`、`SCARD`

**标签：** 查看、集合、全部、成员、查询

---

**SPOP**　`中危`

> 随机移除并返回集合中的一个或多个成员——适用于抽奖、随机分配等场景

**语法：**

```redis
SPOP key [count]
```

**示例：**

1. 从奖池中随机抽一个奖品（拿走即移除）

   ```redis
   SPOP lottery:pool
   ```

2. 随机分配 3 个任务给当前 worker

   ```redis
   SPOP tasks:pending 3
   ```

**相关命令：** `SRANDMEMBER`、`SREM`、`SADD`、`SMEMBERS`

**标签：** 随机、弹出、集合、抽奖、移除

---

**SRANDMEMBER**　`低危`

> 随机返回集合中的一个或多个成员但不移除——适用于推荐、随机展示等场景

**语法：**

```redis
SRANDMEMBER key [count]
```

**示例：**

1. 随机推荐 5 篇文章给用户（不消耗）

   ```redis
   SRANDMEMBER articles:hot 5
   ```

2. count 为负数时允许重复

   ```redis
   SRANDMEMBER candidates -3
   ```

**相关命令：** `SPOP`、`SMEMBERS`、`SADD`

**标签：** 随机、集合、抽取、推荐、展示

---

**SREM**　`中危`

> 移除集合中的一个或多个成员

**语法：**

```redis
SREM key member [member ...]
```

**示例：**

1. 移除用户标签

   ```redis
   SREM user:1:tags inactive
   ```

**相关命令：** `SADD`、`SMEMBERS`

**标签：** 移除、删除、集合、成员

---

**SUNION**　`低危`

> 返回多个集合的并集

**语法：**

```redis
SUNION key [key ...]
```

**示例：**

1. 合并两个群组的成员

   ```redis
   SUNION group:admins group:moderators
   ```

**相关命令：** `SINTER`、`SDIFF`

**标签：** 并集、集合、计算、合并

---

#### sorted-set

**ZADD**　`低危`

> 向有序集合中添加一个或多个成员及分数

**语法：**

```redis
ZADD key [NX|XX] [GT|LT] [CH] [INCR] score member [score member ...]
```

**常用参数：**
- `NX`：仅添加新成员
- `XX`：仅更新已存在成员
- `INCR`：递增分数而非设置

**示例：**

1. 添加玩家分数

   ```redis
   ZADD leaderboard 1000 player:1 950 player:2 1200 player:3
   ```

**相关命令：** `ZREM`、`ZSCORE`、`ZRANGE`、`ZRANK`

**标签：** 添加、有序集合、分数、排名、写入

---

**ZCARD**　`低危`

> 返回有序集合中元素的数量

**语法：**

```redis
ZCARD key
```

**示例：**

1. 统计排行榜成员数

   ```redis
   ZCARD leaderboard
   ```

**相关命令：** `ZADD`、`ZCOUNT`

**标签：** 统计、有序集合、大小、数量

---

**ZCOUNT**　`低危`

> 返回有序集合中分数在指定区间内的成员数量

**语法：**

```redis
ZCOUNT key min max
```

**示例：**

1. 统计分数 60-100 的及格人数

   ```redis
   ZCOUNT exam:scores 60 100
   ```

2. 排除边界（用小括号表示开区间）

   ```redis
   ZCOUNT exam:scores (60 (100
   ```

**相关命令：** `ZRANGEBYSCORE`、`ZCARD`、`ZADD`

**标签：** 计数、区间、分数、有序集合、统计

---

**ZINCRBY**　`中危`

> 为有序集合中成员的分数加上增量

**语法：**

```redis
ZINCRBY key increment member
```

**示例：**

1. 玩家得分 +50

   ```redis
   ZINCRBY leaderboard 50 player:1
   ```

**相关命令：** `ZADD`、`ZSCORE`

**标签：** 递增、分数、有序集合、更新、排名变化

---

**ZPOPMAX**　`中危`

> 移除并返回有序集合中分数最高的一个或多个成员——适用于消费高优先级任务或排行榜淘汰

**语法：**

```redis
ZPOPMAX key [count]
```

**示例：**

1. 淘汰排行榜末尾玩家（最高分=最低排名）

   ```redis
   ZPOPMAX leaderboard 10
   ```

**相关命令：** `ZPOPMIN`、`ZADD`、`ZREM`、`BZPOPMAX`

**标签：** 弹出、最大、有序集合、移除、排行榜

---

**ZPOPMIN**　`中危`

> 移除并返回有序集合中分数最低的一个或多个成员——适用于消费低优先级任务

**语法：**

```redis
ZPOPMIN key [count]
```

**示例：**

1. 消费分数最低（最优先）的 3 个任务

   ```redis
   ZPOPMIN tasks:queue 3
   ```

**相关命令：** `ZPOPMAX`、`ZADD`、`ZREM`、`BZPOPMIN`

**标签：** 弹出、最小、有序集合、移除、消费、优先级

---

**ZRANGE**　`低危`

> 按索引区间返回有序集合中的成员（分数低到高）

**语法：**

```redis
ZRANGE key start stop [WITHSCORES]
```

**示例：**

1. 获取排行榜 Top 10（升序）

   ```redis
   ZRANGE leaderboard 0 9 WITHSCORES
   ```

**相关命令：** `ZREVRANGE`、`ZRANK`、`ZADD`

**标签：** 范围、有序集合、查询、排名、升序

---

**ZRANGEBYSCORE**　`低危`

> 按分数区间返回有序集合中的成员（升序），支持偏移和数量限制

**语法：**

```redis
ZRANGEBYSCORE key min max [WITHSCORES] [LIMIT offset count]
```

**常用参数：**
- `WITHSCORES`：同时返回成员的分数
- `LIMIT offset count`：偏移量和返回数量限制，用于分页

**示例：**

1. 查询及格学生（60-100 分）

   ```redis
   ZRANGEBYSCORE exam:scores 60 100 WITHSCORES
   ```

2. 分页查询第 2 页（每页 10 条）

   ```redis
   ZRANGEBYSCORE exam:scores 60 100 WITHSCORES LIMIT 10 10
   ```

**相关命令：** `ZRANGE`、`ZCOUNT`、`ZADD`、`ZREVRANGEBYSCORE`

**标签：** 范围、分数、有序集合、查询、区间

---

**ZRANK**　`低危`

> 返回有序集合中成员的排名（分数低到高，0-based）

**语法：**

```redis
ZRANK key member
```

**示例：**

1. 查询玩家排名

   ```redis
   ZRANK leaderboard player:1
   ```

**相关命令：** `ZREVRANK`、`ZSCORE`、`ZRANGE`

**标签：** 排名、有序集合、查询、索引

---

**ZREM**　`中危`

> 移除有序集合中的一个或多个成员

**语法：**

```redis
ZREM key member [member ...]
```

**示例：**

1. 从排行榜移除玩家

   ```redis
   ZREM leaderboard player:2
   ```

**相关命令：** `ZADD`、`ZRANK`

**标签：** 移除、删除、有序集合、成员

---

**ZREVRANGE**　`低危`

> 按索引区间返回有序集合中的成员，按分数从高到低排序（ZRANGE 的反向版本）

**语法：**

```redis
ZREVRANGE key start stop [WITHSCORES]
```

**常用参数：**
- `WITHSCORES`：同时返回成员的分数

**示例：**

1. 获取排行榜 Top 10（分数从高到低）

   ```redis
   ZREVRANGE leaderboard 0 9 WITHSCORES
   ```

**相关命令：** `ZRANGE`、`ZREVRANK`、`ZADD`、`ZRANGEBYSCORE`

**标签：** 逆序、有序集合、查询、排名、降序、排行榜

---

**ZSCORE**　`低危`

> 返回有序集合中成员的分数

**语法：**

```redis
ZSCORE key member
```

**示例：**

1. 查询玩家分数

   ```redis
   ZSCORE leaderboard player:1
   ```

**相关命令：** `ZADD`、`ZRANK`、`ZRANGE`

**标签：** 查询、分数、有序集合、排名

---

#### stream

**XACK**　`低危`

> 确认消费者组中的消息已被处理——ACK 后消息从 PEL（待处理列表）中移除

**语法：**

```redis
XACK key group id [id ...]
```

**示例：**

1. 确认单条消息已处理

   ```redis
   XACK mystream mygroup 1699999999999-0
   ```

2. 批量确认多条消息

   ```redis
   XACK mystream mygroup 1699999999999-0 1699999999999-1 1699999999999-2
   ```

**相关命令：** `XREADGROUP`、`XGROUP`、`XPENDING`、`XADD`

**标签：** 确认、ACK、消费者组、消息处理、Stream

---

**XADD**　`低危`

> 向 Stream 追加一条消息——自动生成全局唯一 ID，支持 MAXLEN 自动裁剪限制长度

**语法：**

```redis
XADD key [NOMKSTREAM] [MAXLEN|MINID [=] threshold] *|ID field value [field value ...]
```

**常用参数：**
- `MAXLEN ~ N`：近似裁剪，保留最近 N 条消息
- `NOMKSTREAM`：如果 Stream 不存在则不创建
- `*`：由 Redis 自动生成消息 ID（推荐）

**示例：**

1. 追加一条消息（自动生成 ID）

   ```redis
   XADD mystream * sensor_id 1234 temperature 19.8
   ```

2. 追加并限制 Stream 最多保留 1000 条

   ```redis
   XADD mystream MAXLEN ~ 1000 * event login user_id 42
   ```

**相关命令：** `XRANGE`、`XREAD`、`XREADGROUP`、`XGROUP`、`XDEL`、`XLEN`

**标签：** Stream、消息、追加、消息队列、事件、日志

---

**XDEL**　`中危`

> 从 Stream 中删除指定消息——消息不会立即从内存移除，只做删除标记

**语法：**

```redis
XDEL key id [id ...]
```

**示例：**

1. 删除单条消息

   ```redis
   XDEL mystream 1699999999999-0
   ```

**相关命令：** `XADD`、`XRANGE`、`XTRIM`、`XLEN`

**标签：** 删除、移除、Stream、消息、清理

---

**XGROUP**　`中危`

> 管理 Stream 消费者组——支持创建(CREATE)、删除(DESTROY)、删除消费者(DELCONSUMER)、设置起始 ID(SETID)

**语法：**

```redis
XGROUP subcommand key group [argument ...]
```

**常用参数：**
- `CREATE <key> <group> <id>`：创建消费者组，id 指定起始消费位置（$ 表示只消费新消息，0 表示从头开始）
- `DESTROY <key> <group>`：删除消费者组及所有关联消费者
- `DELCONSUMER <key> <group> <consumer>`：删除消费者组中的指定消费者
- `SETID <key> <group> <id>`：修改消费者组的最后投递 ID

**示例：**

1. 创建消费者组（从当前最新开始消费）

   ```redis
   XGROUP CREATE mystream mygroup $
   ```

2. 创建消费者组（流不存在时自动创建，从头消费）

   ```redis
   XGROUP CREATE mystream mygroup 0 MKSTREAM
   ```

**相关命令：** `XREADGROUP`、`XACK`、`XADD`、`XPENDING`

**标签：** 消费者组、管理、创建、删除、Stream

---

**XLEN**　`低危`

> 返回 Stream 中的消息总数——O(1) 时间复杂度

**语法：**

```redis
XLEN key
```

**示例：**

1. 查看 Stream 中消息数量

   ```redis
   XLEN mystream
   ```

**相关命令：** `XADD`、`XRANGE`、`XTRIM`、`XINFO`

**标签：** 长度、计数、Stream、消息、统计

---

**XPENDING**　`低危`

> 查看消费者组中待处理的消息——用于监控消息积压、排查未 ACK 消息、消费者健康检查

**语法：**

```redis
XPENDING key group [[IDLE min-idle-time] start end count [consumer]]
```

**常用参数：**
- `IDLE ms`：只返回空闲超过指定毫秒的消息

**示例：**

1. 查看消费者组待处理消息总数

   ```redis
   XPENDING mystream mygroup
   ```

2. 查看超过 60 秒未 ACK 的消息（异常排查）

   ```redis
   XPENDING mystream mygroup IDLE 60000 - + 10
   ```

**相关命令：** `XACK`、`XREADGROUP`、`XGROUP`、`XADD`

**标签：** 待处理、PEL、消费者组、诊断、监控、Stream

---

**XRANGE**　`低危`

> 按 ID 范围正序读取 Stream 中的消息——支持 -（最小）和 +（最大）作为边界，支持 COUNT 限制条数

**语法：**

```redis
XRANGE key start end [COUNT count]
```

**常用参数：**
- `COUNT count`：最多返回 count 条消息

**示例：**

1. 读取 Stream 中所有消息

   ```redis
   XRANGE mystream - +
   ```

2. 读取最新的 10 条消息

   ```redis
   XRANGE mystream - + COUNT 10
   ```

**相关命令：** `XREVRANGE`、`XADD`、`XREAD`、`XLEN`、`XDEL`

**标签：** 读取、范围、正序、Stream、消息、查询

---

**XREAD**　`低危`

> 阻塞或非阻塞地从多个 Stream 读取消息——支持从指定 ID 之后读取，支持 BLOCK 阻塞等待新消息

**语法：**

```redis
XREAD [COUNT count] [BLOCK milliseconds] STREAMS key [key ...] id [id ...]
```

**常用参数：**
- `COUNT count`：每个 Stream 最多返回 count 条
- `BLOCK ms`：阻塞等待 ms 毫秒，0 表示永久阻塞

**示例：**

1. 读取所有新消息（从 ID 0 开始）

   ```redis
   XREAD COUNT 10 STREAMS mystream 0
   ```

2. 阻塞等待新消息（最大 5 秒）

   ```redis
   XREAD BLOCK 5000 STREAMS mystream $
   ```

**相关命令：** `XREADGROUP`、`XRANGE`、`XADD`、`XGROUP`

**标签：** 读取、阻塞、多流、消费者、Stream、消息

---

**XREADGROUP**　`低危`

> 消费者组模式读取 Stream 消息——支持消息确认、未确认消息重投、新消息分发，是实现可靠消息队列的核心命令

**语法：**

```redis
XREADGROUP GROUP group consumer [COUNT count] [BLOCK ms] [NOACK] STREAMS key [key ...] id [id ...]
```

**常用参数：**
- `COUNT count`：最多返回 count 条消息
- `BLOCK ms`：阻塞等待 ms 毫秒
- `NOACK`：不等待确认，读取后即标记已处理

**示例：**

1. 消费者组读取新消息

   ```redis
   XREADGROUP GROUP mygroup consumer1 COUNT 5 STREAMS mystream >
   ```

2. 重新投递未确认消息（id=0）

   ```redis
   XREADGROUP GROUP mygroup consumer1 STREAMS mystream 0
   ```

**相关命令：** `XREAD`、`XGROUP`、`XACK`、`XADD`、`XPENDING`

**标签：** 消费者组、读取、分发、可靠队列、Stream、ACK

---

**XREVRANGE**　`低危`

> 按 ID 范围逆序读取 Stream 中的消息——从最新到最旧，与 XRANGE 相反

**语法：**

```redis
XREVRANGE key end start [COUNT count]
```

**常用参数：**
- `COUNT count`：最多返回 count 条消息

**示例：**

1. 查看最新 5 条消息（逆序）

   ```redis
   XREVRANGE mystream + - COUNT 5
   ```

**相关命令：** `XRANGE`、`XADD`、`XREAD`、`XLEN`

**标签：** 读取、范围、逆序、Stream、消息、最新

---

**XTRIM**　`中危`

> 裁剪 Stream 长度——按 MAXLEN（最大消息数）或 MINID（最小 ID）策略删除旧消息

**语法：**

```redis
XTRIM key MAXLEN [=|~] count
```

**常用参数：**
- `MAXLEN = count`：精确裁剪，严格保留 count 条
- `MAXLEN ~ count`：近似裁剪，性能更好（推荐）
- `MINID = id`：删除所有 ID 小于指定值的消息

**示例：**

1. 裁剪为最多保留 1000 条（近似，高效）

   ```redis
   XTRIM mystream MAXLEN ~ 1000
   ```

2. 精确裁剪为 1000 条

   ```redis
   XTRIM mystream MAXLEN = 1000
   ```

**相关命令：** `XADD`、`XDEL`、`XLEN`、`XRANGE`

**标签：** 裁剪、截断、限制长度、Stream、清理

---

#### string

**APPEND**　`低危`

> 将 value 追加到 key 的现有值末尾

**语法：**

```redis
APPEND key value
```

**示例：**

1. 追加日志内容

   ```redis
   APPEND log:errors 'Connection timeout'
   ```

**相关命令：** `SET`、`GET`、`STRLEN`

**标签：** 追加、字符串、拼接、写入

---

**DECR**　`中危`

> 将 key 中储存的数字值减 1（原子递减）

**语法：**

```redis
DECR key
```

**示例：**

1. 库存扣减

   ```redis
   DECR stock:item-123
   ```

**相关命令：** `INCR`、`DECRBY`

**标签：** 递减、计数器、原子、数字、自减

---

**GET**　`低危`

> 获取指定 key 的值，key 不存在则返回 nil

**语法：**

```redis
GET key
```

**示例：**

1. 获取 key 的值

   ```redis
   GET user:1:name
   ```

**相关命令：** `SET`、`MGET`、`GETSET`、`STRLEN`

**标签：** 获取、读取、查询、字符串、缓存

---

**GETRANGE**　`低危`

> 返回 key 中字符串值的子字符串（按字节位置），类似 substr()

**语法：**

```redis
GETRANGE key start end
```

**示例：**

1. 获取字符串的前 5 个字符

   ```redis
   SET msg 'Hello World'
   GETRANGE msg 0 4
   ```

2. 获取最后 5 个字符（负数表示从末尾计数）

   ```redis
   GETRANGE msg -5 -1
   ```

**相关命令：** `SETRANGE`、`GET`、`STRLEN`、`SUBSTR`

**标签：** 子串、切片、字符串、截取、范围

---

**GETSET**　`中危`

> 设置新值并返回旧值（原子操作）

**语法：**

```redis
GETSET key value
```

**示例：**

1. 更新计数器并获取旧值

   ```redis
   GETSET page:views 0
   ```

**相关命令：** `GET`、`SET`、`INCR`

**标签：** 获取、设置、原子、更新、计数器重置

---

**INCR**　`中危`

> 将 key 中储存的数字值增 1（原子递增）

**语法：**

```redis
INCR key
```

**示例：**

1. 页面访问计数

   ```redis
   INCR page:home:views
   ```

2. 生成自增 ID

   ```redis
   INCR order:id
   ```

**相关命令：** `DECR`、`INCRBY`、`GET`、`SET`

**标签：** 递增、计数器、原子、数字、自增

---

**INCRBYFLOAT**　`低危`

> 将 key 中储存的数字值加上指定的浮点数增量（原子操作）

**语法：**

```redis
INCRBYFLOAT key increment
```

**示例：**

1. 给账户余额加 9.99 元

   ```redis
   INCRBYFLOAT account:balance 9.99
   ```

2. 扣除 5.50（传负数）

   ```redis
   INCRBYFLOAT account:balance -5.50
   ```

**相关命令：** `INCR`、`INCRBY`、`DECR`、`GET`、`SET`

**标签：** 递增、浮点数、小数、原子、计数、精度

---

**MGET**　`低危`

> 批量获取多个 key 的值

**语法：**

```redis
MGET key [key ...]
```

**示例：**

1. 批量获取多个用户名称

   ```redis
   MGET user:1:name user:2:name user:3:name
   ```

**相关命令：** `GET`、`MSET`

**标签：** 批量、获取、多个、读取、性能

---

**MSET**　`中危`

> 批量设置多个 key-value 对（原子操作）

**语法：**

```redis
MSET key value [key value ...]
```

**示例：**

1. 批量设置多个键值

   ```redis
   MSET user:1:name Alice user:2:name Bob user:3:name Carol
   ```

**相关命令：** `SET`、`MGET`

**标签：** 批量、设置、多个、写入、原子

---

**SET**　`低危`

> 设置指定 key 的值，支持过期时间和条件设置

**语法：**

```redis
SET key value [EX seconds|PX milliseconds] [NX|XX] [KEEPTTL] [GET]
```

**常用参数：**
- `EX seconds`：设置过期时间（秒）
- `NX`：仅当 key 不存在时才设置
- `XX`：仅当 key 已存在时才设置

**示例：**

1. 设置一个键值对

   ```redis
   SET user:1:name Alice
   ```

2. 设置键值对并指定 10 秒过期

   ```redis
   SET session:token abc123 EX 10
   ```

3. 仅当不存在时设置（分布式锁）

   ```redis
   SET lock:resource-123 token NX EX 30
   ```

**相关命令：** `GET`、`SETNX`、`SETEX`、`MSET`、`GETSET`

**标签：** 设置、写入、字符串、创建、更新、缓存

---

**SETEX**　`低危`

> 设置 key 的值并同时指定过期时间（秒）——SET + EXPIRE 的原子版本

**语法：**

```redis
SETEX key seconds value
```

**示例：**

1. 缓存数据 60 秒后自动过期

   ```redis
   SETEX user:1:profile 60 '{"name":"Alice","age":25}'
   ```

2. 设置验证码 300 秒（5 分钟）有效

   ```redis
   SETEX sms:code:13800138000 300 492837
   ```

**相关命令：** `SET`、`SETNX`、`EXPIRE`、`PSETEX`、`GETSET`

**标签：** 设置、过期、原子、字符串、缓存、TTL

---

**SETNX**　`低危`

> 仅当 key 不存在时设置值（SET if Not eXists）

**语法：**

```redis
SETNX key value
```

**示例：**

1. 仅当 key 不存在时设置

   ```redis
   SETNX lock:order-456 1
   ```

**相关命令：** `SET`、`SETEX`、`GET`

**标签：** 设置、创建、不存在、原子、分布式锁

---

**SETRANGE**　`中危`

> 从指定偏移量开始覆写字符串值，如果偏移量超出原长度则用零字节填充

**语法：**

```redis
SETRANGE key offset value
```

**示例：**

1. 替换字符串中指定位置的内容

   ```redis
   SET msg 'Hello World'
   SETRANGE msg 6 'Redis'
   ```

**相关命令：** `GETRANGE`、`SET`、`APPEND`、`STRLEN`

**标签：** 覆写、字符串、偏移、修改、替换

---

**STRLEN**　`低危`

> 返回 key 所储存的字符串值的长度

**语法：**

```redis
STRLEN key
```

**示例：**

1. 获取值的长度

   ```redis
   STRLEN user:1:bio
   ```

**相关命令：** `GET`、`APPEND`

**标签：** 长度、字符串、查询

---

#### transaction

**DISCARD**　`低危`

> 放弃当前事务块——清除 MULTI 后排队的全部命令，并取消 WATCH 对所有 key 的监视

**语法：**

```redis
DISCARD
```

**示例：**

1. 放弃事务中的操作

   ```redis
   MULTI
   SET temp:1 'draft'
   DISCARD  # 队列被清空，SET 不会执行
   ```

**相关命令：** `MULTI`、`EXEC`、`WATCH`、`UNWATCH`

**标签：** 事务、放弃、回滚、取消、清除

---

**EXEC**　`中危`

> 执行 MULTI 开启的事务块中所有排队的命令——所有命令按顺序原子执行，中间不会被其他客户端打断

**语法：**

```redis
EXEC
```

**示例：**

1. 提交事务块

   ```redis
   MULTI
   SET key1 val1
   SET key2 val2
   EXEC  # 返回 [OK, OK]
   ```

2. WATCH 后的 EXEC——如果被监视 key 被修改，EXEC 返回 nil

   ```redis
   WATCH balance
   MULTI
   DECRBY balance 100
   EXEC  # 若 balance 被修改则返回 nil
   ```

**相关命令：** `MULTI`、`DISCARD`、`WATCH`、`UNWATCH`

**标签：** 事务、执行、原子、提交、批量

---

**MULTI**　`中危`

> 开启一个事务块——后续命令进入队列，直到 EXEC 执行才会原子性地批量提交

**语法：**

```redis
MULTI
```

**示例：**

1. 原子性转账：A 减 100，B 加 100

   ```redis
   MULTI
   DECRBY account:A 100
   INCRBY account:B 100
   EXEC
   ```

**相关命令：** `EXEC`、`DISCARD`、`WATCH`、`UNWATCH`

**标签：** 事务、原子、批量、队列、开启

---

**UNWATCH**　`低危`

> 取消 WATCH 对所有 key 的监视——在执行 EXEC/DISCARD 后自动调用，也可手动调用

**语法：**

```redis
UNWATCH
```

**示例：**

1. 手动取消所有 key 的监视

   ```redis
   WATCH key1 key2
   # ... 决定不执行事务
   UNWATCH
   ```

**相关命令：** `WATCH`、`MULTI`、`EXEC`、`DISCARD`

**标签：** 取消监视、事务、解锁

---

**WATCH**　`低危`

> 监视指定 key——如果在 EXEC 执行前被监视的 key 被其他客户端修改，事务将自动放弃（乐观锁）

**语法：**

```redis
WATCH key [key ...]
```

**示例：**

1. 乐观锁扣库存——仅当库存未变时才执行

   ```redis
   WATCH stock:sku001
   val = GET stock:sku001
   MULTI
   DECRBY stock:sku001 1
   EXEC  # 若 stock 被改则返回 nil，需重试
   ```

**相关命令：** `UNWATCH`、`MULTI`、`EXEC`、`DISCARD`

**标签：** 监视、乐观锁、CAS、事务、一致性

---

### 配方（18 个）

#### 📋 配方 · 分布式锁 — SET NX EX

**分布式锁 — SET NX EX**

> 使用 SET NX EX 实现简单分布式锁：获取锁 → 执行业务 → Lua 脚本原子释放。核心要点：必须设置过期时间防止死锁，释放时必须验证 token 防止误删。

**一键执行：**

```redis
# 获取锁
SET lock:order-123 token-uuid NX EX 30

# 执行业务逻辑...

# 原子释放锁（仅当 token 匹配时删除）
EVAL "if redis.call('get',KEYS[1])==ARGV[1] then return redis.call('del',KEYS[1]) end return 0" 1 lock:order-123 token-uuid
```

**步骤拆解：**

1. 尝试获取锁（NX = 仅当 key 不存在，EX 30 = 30 秒自动过期防死锁）

   ```redis
   SET lock:order-123 token-uuid NX EX 30
   ```

2. 执行业务逻辑（如扣库存、创建订单等）

   ```redis
   ... your business logic ...
   ```

3. Lua 脚本原子释放：检查 token 是否匹配，匹配才删除

   ```redis
   EVAL "if redis.call('get',KEYS[1])==ARGV[1] then return redis.call('del',KEYS[1]) end return 0" 1 lock:order-123 token-uuid
   ```

**标签：** 锁、分布式、并发、原子、Lua、NX、互斥

---

#### 📋 配方 · 简单限流器 — INCR + EXPIRE

**简单限流器 — INCR + EXPIRE**

> 基于 INCR 实现 API 调用频率限制：每次请求对计数器自增，首次设置过期时间。如果计数超过阈值（如 100 次/分钟）则拒绝请求。

**一键执行：**

```lua
local current = redis.call('INCR', KEYS[1])
if current == 1 then
    redis.call('EXPIRE', KEYS[1], ARGV[1])
end
if current > tonumber(ARGV[2]) then
    return 0
end
return 1
```

**步骤拆解：**

1. 定义限流 Lua 脚本（原子操作）

   ```lua
   local current = redis.call('INCR', KEYS[1])
   if current == 1 then
       redis.call('EXPIRE', KEYS[1], ARGV[1])
   end
   if current > tonumber(ARGV[2]) then
       return 0
   end
   return 1
   ```

2. 客户端调用：key=限流标识，ARGV[1]=窗口秒数，ARGV[2]=阈值

   ```lua
   EVAL <script> 1 rate:api:user123 60 100
   ```

**标签：** 限流、频率、计数、原子、Lua、API

---

#### 📋 配方 · 乐观锁 — WATCH + MULTI/EXEC

**乐观锁 — WATCH + MULTI/EXEC**

> 使用 WATCH 实现乐观锁：监控 key → 读取值 → 在事务中更新，如果 key 在 WATCH 后被其他客户端修改，事务自动放弃。适用于转账、库存扣减等需要数据一致性的场景。

**一键执行：**

```redis
WATCH account:A account:B
valA = GET account:A
valB = GET account:B
MULTI
DECRBY account:A 100
INCRBY account:B 100
EXEC
```

**步骤拆解：**

1. 监控要操作的 key（任何修改将导致事务放弃）

   ```redis
   WATCH account:A account:B
   ```

2. 读取当前余额

   ```redis
   GET account:A
   GET account:B
   ```

3. 开启事务，执行转账

   ```redis
   MULTI
   DECRBY account:A 100
   INCRBY account:B 100
   EXEC
   ```

4. 如果 EXEC 返回 nil，说明数据被修改，重试整个流程

   ```redis
   # 客户端应检查 EXEC 返回值，返回 nil 则重试
   ```

**标签：** 乐观锁、事务、WATCH、一致性、转账、CAS

---

#### 📋 配方 · 排行榜 Top N — ZADD + ZREVRANGE

**排行榜 Top N — ZADD + ZREVRANGE**

> 使用有序集合实现实时排行榜：ZADD 更新分数，ZREVRANGE 查询排名。支持按分数范围查询、按排名范围查询。

**一键执行：**

```redis
# 更新玩家分数
ZADD leaderboard 1500 player:1
ZADD leaderboard 1200 player:2
ZADD leaderboard 1800 player:3

# 查询 Top 5（分数从高到低）
ZREVRANGE leaderboard 0 4 WITHSCORES
```

**步骤拆解：**

1. 更新或添加玩家分数（分数相同按成员名字典序排）

   ```redis
   ZADD leaderboard 1500 player:1
   ```

2. 查询前 5 名（ZREVRANGE 逆序 = 高分在前）

   ```redis
   ZREVRANGE leaderboard 0 4 WITHSCORES
   ```

3. 查询指定玩家排名（0-based）

   ```redis
   ZREVRANK leaderboard player:1
   ```

**标签：** 排行榜、有序集合、排序、游戏、排名、Top N

---

#### 📋 配方 · 消息队列 — LPUSH + BRPOP

**消息队列 — LPUSH + BRPOP**

> 使用列表实现简单的生产者-消费者消息队列：生产者 LPUSH 消息到列表，消费者 BRPOP 阻塞等待。BRPOP 支持超时，避免空轮询消耗 CPU。

**一键执行：**

```redis
# 生产者
LPUSH queue:emails 'to:alice@example.com, subject:Welcome'

# 消费者（阻塞等待 5 秒）
BRPOP queue:emails 5
```

**步骤拆解：**

1. 生产者将消息推入队列头部

   ```redis
   LPUSH queue:emails '{...message...}'
   ```

2. 消费者阻塞弹出（最多等待 5 秒，队列空则返回 nil）

   ```redis
   BRPOP queue:emails 5
   ```

3. 多消费者自动负载均衡：一条消息只被一个消费者获取

   ```redis
   # 启动多个消费者实例，Redis 自动分配消息
   ```

**标签：** 消息队列、列表、阻塞、生产者、消费者、异步

---

#### 📋 配方 · 数据备份 — BGSAVE + LASTSAVE

**数据备份 — BGSAVE + LASTSAVE**

> 后台异步持久化 RDB 快照。先检查上次备份状态，触发 BGSAVE，轮询 LASTSAVE 确认完成。

**一键执行：**

```redis
# 检查上次备份时间
LASTSAVE

# 触发后台保存
BGSAVE

# 等待完成后再次检查
LASTSAVE
```

**步骤拆解：**

1. 查看上次成功保存的时间戳

   ```redis
   LASTSAVE
   ```

2. 触发后台 RDB 快照（fork 子进程，不阻塞主线程）

   ```redis
   BGSAVE
   ```

3. 确认备份完成（对比前后 LASTSAVE 时间）

   ```redis
   LASTSAVE
   ```

**标签：** 备份、持久化、RDB、快照、运维、安全

---

#### 📋 配方 · Cache-Aside — GET + SET EX

**Cache-Aside — GET + SET EX**

> 经典缓存穿透模式：先查 Redis，命中直接返回；未命中则查 DB，结果写回 Redis 并设 TTL。降低 DB 压力，适用于读多写少的热点数据。

**一键执行：**

```redis
# 伪代码流程
val = GET cache:user:123
if val:
    return val
val = DB.query('SELECT * FROM users WHERE id=123')
SETEX cache:user:123 3600 val
return val
```

**步骤拆解：**

1. 先查缓存

   ```redis
   GET cache:user:123
   ```

2. 缓存未命中 → 查数据库

   ```redis
   # val = DB.query('SELECT ...')
   ```

3. 写回缓存并设 1 小时过期

   ```redis
   SETEX cache:user:123 3600 '<serialized data>'
   ```

**标签：** 缓存、Cache-Aside、穿透、DB、TTL、读多写少

---

#### 📋 配方 · 缓存雪崩防护 — SET 随机 EX

**缓存雪崩防护 — SET 随机 EX**

> 批量缓存预热时为每个 key 设置随机偏移的过期时间，避免大量 key 同一时刻同时过期导致 DB 压力骤增。

**一键执行：**

```redis
# 基础 TTL 1 小时（3600s），随机偏移 ±600s
SET cache:hot:article:1 '<data>' EX 3600
SET cache:hot:article:2 '<data>' EX 3420
SET cache:hot:article:3 '<data>' EX 3780
```

**步骤拆解：**

1. 为每个缓存 key 设置略有差异的过期时间

   ```redis
   SET cache:hot:article:1 '<data>' EX 3600
   ```

2. 第二个 key 过期时间偏移 -2 分钟

   ```redis
   SET cache:hot:article:2 '<data>' EX 3420
   ```

3. 第三个 key 过期时间偏移 +2 分钟

   ```redis
   SET cache:hot:article:3 '<data>' EX 3780
   ```

4. 核心：生产代码中应使用 random.randint(-600, 600) 为每个 key 生成随机偏移

   ```redis
   # TTL = 3600 + random.randint(-600, 600)
   ```

**标签：** 缓存、雪崩、过期、随机、批量、DB保护

---

#### 📋 配方 · 分布式 ID 生成器 — INCR

**分布式 ID 生成器 — INCR**

> 使用 Redis 原子递增生成全局唯一的递增 ID——比数据库自增更灵活，比雪花算法更简单，适合订单号/用户ID等场景。

**一键执行：**

```redis
# 初始化（可选）
SET seq:order:id 0

# 每次获取新 ID
INCR seq:order:id
# 返回 1, 2, 3, ...
```

**步骤拆解：**

1. 初始化序列（如果不存在，INCR 自动从 0+1 开始，此步可省略）

   ```redis
   SET seq:order:id 0
   ```

2. 原子获取下一个 ID

   ```redis
   INCR seq:order:id
   ```

3. 组合业务前缀生成订单号

   ```redis
   # order_no = f'ORD-{datetime.now():%Y%m%d}-{id:08d}'
   ```

**标签：** 分布式ID、原子、递增、订单号、唯一、序列

---

#### 📋 配方 · 滑动窗口限流 — ZSET + Lua

**滑动窗口限流 — ZSET + Lua**

> 使用有序集合实现精确的滑动窗口限流：每次请求将当前时间戳加入 ZSET，同时删除窗口外的旧记录，再计数判断。比 INCR 固定窗口更精确，避免边界突发。

**一键执行：**

```lua
local now = redis.call('TIME')[1]
local window = tonumber(ARGV[1])
local threshold = tonumber(ARGV[2])
redis.call('ZREMRANGEBYSCORE', KEYS[1], 0, now - window)
local count = redis.call('ZCARD', KEYS[1])
if count >= threshold then return 0 end
redis.call('ZADD', KEYS[1], now, now .. '-' .. count)
redis.call('EXPIRE', KEYS[1], window)
return 1
```

**步骤拆解：**

1. Lua 脚本：删除窗口外的旧请求

   ```lua
   redis.call('ZREMRANGEBYSCORE', KEYS[1], 0, now - window)
   ```

2. 统计当前窗口内请求数

   ```lua
   local count = redis.call('ZCARD', KEYS[1])
   ```

3. 超过阈值则拒绝（返回 0）

   ```lua
   if count >= threshold then return 0 end
   ```

4. 记录本次请求时间戳

   ```lua
   redis.call('ZADD', KEYS[1], now, now .. '-' .. count)
   ```

5. 客户端调用（60s 窗口内最多 100 次）

   ```lua
   EVAL <script> 1 rate:api:user123 60 100
   ```

**标签：** 限流、滑动窗口、精确、有序集合、ZSET、防刷

---

#### 📋 配方 · 延迟队列 — ZADD + ZRANGEBYSCORE

**延迟队列 — ZADD + ZRANGEBYSCORE**

> 使用有序集合实现延迟队列：消息体为 member，执行时间为 score。消费者轮询 ZRANGEBYSCORE 获取到期任务，ZREM 确认消费。适用于订单超时取消、定时通知等。

**一键执行：**

```redis
# 生产者：添加 30 秒后执行的任务
ZADD delay:queue 1735690000 '{"orderId":123,"action":"cancel"}'

# 消费者：拉取到期任务
ZRANGEBYSCORE delay:queue 0 1735690000 LIMIT 0 10

# 确认消费（移除）
ZREM delay:queue '{"orderId":123,"action":"cancel"}'
```

**步骤拆解：**

1. 添加延迟任务（score = 执行时间戳）

   ```redis
   ZADD delay:queue 1735690000 '{"orderId":123,"action":"cancel"}'
   ```

2. 消费者轮询：拉取当前时间之前的到期任务

   ```redis
   ZRANGEBYSCORE delay:queue 0 <now_timestamp> LIMIT 0 10
   ```

3. 确认消费后移除（需用原子 Lua 防止重复消费）

   ```redis
   ZREM delay:queue '{"orderId":123,"action":"cancel"}'
   ```

**标签：** 延迟队列、定时、任务、有序集合、超时、取消

---

#### 📋 配方 · 共同好友 — SINTER

**共同好友 — SINTER**

> 使用集合交集运算实现「共同好友/共同关注」功能：两个用户的关注列表做交集，秒级返回结果。

**一键执行：**

```redis
# 用户 1 的好友
SADD friends:alice bob charlie dave eve

# 用户 2 的好友
SADD friends:bob alice charlie frank

# 共同好友
SINTER friends:alice friends:bob
# 返回：charlie
```

**步骤拆解：**

1. 存储用户 A 的好友集合

   ```redis
   SADD friends:alice bob charlie dave eve
   ```

2. 存储用户 B 的好友集合

   ```redis
   SADD friends:bob alice charlie frank
   ```

3. 求交集 = 共同好友

   ```redis
   SINTER friends:alice friends:bob
   ```

4. 推荐「可能认识的人」= B 的好友 - A 的好友（差集）

   ```redis
   SDIFF friends:bob friends:alice
   ```

**标签：** 共同好友、交集、社交、推荐、集合、SINTER

---

#### 📋 配方 · 浏览历史 — LPUSH + LTRIM

**浏览历史 — LPUSH + LTRIM**

> 使用列表保存用户最近浏览记录：每次浏览 LPUSH 到头部，LTRIM 保留最近 100 条。兼顾写入性能与存储上限。

**一键执行：**

```redis
# 用户浏览了一篇文章
LPUSH history:user:123 'article:456'

# 只保留最近 100 条
LTRIM history:user:123 0 99

# 查看最近 20 条浏览
LRANGE history:user:123 0 19
```

**步骤拆解：**

1. 推送浏览记录到列表头部（最新的在前）

   ```redis
   LPUSH history:user:123 'article:456'
   ```

2. 裁剪保留最近 100 条（防止列表无限增长）

   ```redis
   LTRIM history:user:123 0 99
   ```

3. 查询最近 20 条浏览记录

   ```redis
   LRANGE history:user:123 0 19
   ```

**标签：** 浏览历史、列表、裁剪、去重、最近、用户行为

---

#### 📋 配方 · 实时计数器看板 — HINCRBY + HGETALL

**实时计数器看板 — HINCRBY + HGETALL**

> 使用哈希表做实时统计看板：HINCRBY 原子更新各类指标，HGETALL 一次拉取全量数据。适用于页面 PV/UV、API 调用量、业务指标等实时大盘。

**一键执行：**

```redis
# 更新指标
HINCRBY stats:dashboard:today page_views 1
HINCRBY stats:dashboard:today api_calls 1
HINCRBY stats:dashboard:today errors 1
HINCRBY stats:dashboard:today revenue 999

# 拉取全量看板数据
HGETALL stats:dashboard:today
```

**步骤拆解：**

1. 原子递增各维度指标

   ```redis
   HINCRBY stats:dashboard:today page_views 1
   ```

2. 批量更新多个指标（Pipeline 或事务）

   ```redis
   HINCRBY stats:dashboard:today api_calls 1
   HINCRBY stats:dashboard:today errors 1
   ```

3. 一次拉取全部指标数据

   ```redis
   HGETALL stats:dashboard:today
   ```

4. 每日重置（定时任务新建 key 或 FLUSHDB 特定库）

   ```redis
   # 可用 stats:dashboard:2026-07-31 作为每日独立 key
   ```

**标签：** 计数器、实时、看板、统计、指标、PV、哈希

---

#### 📋 配方 · 大 Key 扫描 — SCAN + MEMORY USAGE

**大 Key 扫描 — SCAN + MEMORY USAGE**

> 使用 SCAN 安全遍历 + MEMORY USAGE 估算内存，排查占用过大的 key。比 KEYS 安全（非阻塞），配合 TYPE 可过滤特定数据类型。

**一键执行：**

```redis
# 逐步扫描，每次 100 个 key
SCAN 0 COUNT 100

# 对可疑大 key 估算内存
MEMORY USAGE user:1:big-hash

# 组合使用：扫描并过滤
SCAN 0 MATCH cache:* COUNT 100
```

**步骤拆解：**

1. 从游标 0 开始扫描（非阻塞，生产安全）

   ```redis
   SCAN 0 COUNT 100
   ```

2. 对返回的每个 key 估算内存占用

   ```redis
   MEMORY USAGE user:1:big-hash
   ```

3. 按模式匹配缩小范围

   ```redis
   SCAN 0 MATCH cache:* COUNT 100
   ```

4. 对于大 key 使用 UNLINK 异步删除（不阻塞）

   ```redis
   UNLINK big:cache:key
   ```

**标签：** 大Key、扫描、内存、诊断、优化、非阻塞

---

#### 📋 配方 · Stream 可靠消息队列 — XADD + XREADGROUP + XACK

**Stream 可靠消息队列 — XADD + XREADGROUP + XACK**

> 使用 Redis Stream + 消费者组实现可靠消息队列：消息持久化 → 消费者组分发 → ACK 确认 → PEL 重投。比 List 队列多了消息确认、重试、多消费者负载均衡能力。

**一键执行：**

```redis
# 1. 创建消费者组
XGROUP CREATE mystream mygroup $ MKSTREAM

# 2. 生产者发布消息
XADD mystream * type order_created order_id 123 amount 99.99

# 3. 消费者读取并处理
XREADGROUP GROUP mygroup consumer1 COUNT 1 BLOCK 5000 STREAMS mystream >

# 4. 确认处理完成
XACK mystream mygroup <message-id>

# 5. 监控积压
XPENDING mystream mygroup
```

**步骤拆解：**

1. 创建消费者组（$ = 只消费新消息，MKSTREAM = 不存在则自动创建）

   ```redis
   XGROUP CREATE mystream mygroup $ MKSTREAM
   ```

2. 生产者追加消息（* = 自动生成 ID）

   ```redis
   XADD mystream * type order_created order_id 123 amount 99.99
   ```

3. 消费者组读取（> = 只获取未分发的消息）

   ```redis
   XREADGROUP GROUP mygroup consumer1 COUNT 1 BLOCK 5000 STREAMS mystream >
   ```

4. 处理完成后确认（从 PEL 中移除）

   ```redis
   XACK mystream mygroup 1699999999999-0
   ```

5. 监控未确认消息积压

   ```redis
   XPENDING mystream mygroup
   ```

**标签：** Stream、消费者组、可靠队列、ACK、消息、重试、分发

---

#### 📋 配方 · 慢查询诊断 — SLOWLOG + CONFIG SET

**慢查询诊断 — SLOWLOG + CONFIG SET**

> 排查 Redis 性能瓶颈的标准流程：查看慢查询日志定位耗时命令，必要时调整阈值，优化后重置统计。

**一键执行：**

```redis
# 1. 查看 Top 10 慢查询
SLOWLOG GET 10

# 2. 把阈值临时调低以抓取更多细节
CONFIG SET slowlog-log-slower-than 1000

# 3. 查看慢查询数量
SLOWLOG LEN

# 4. 分析完毕后清空旧记录
SLOWLOG RESET
```

**步骤拆解：**

1. 查看最近 10 条慢查询（含耗时和命令参数）

   ```redis
   SLOWLOG GET 10
   ```

2. 将慢查询阈值调为 1 毫秒（抓取更细粒度的慢操作）

   ```redis
   CONFIG SET slowlog-log-slower-than 1000
   ```

3. 查看当前积压多少条慢查询

   ```redis
   SLOWLOG LEN
   ```

4. 分析完毕，清空旧记录方便下次排查

   ```redis
   SLOWLOG RESET
   ```

**标签：** 慢查询、性能、诊断、排查、调优、运维

---

#### 📋 配方 · 数据热迁移 — COPY + EXPIRE

**数据热迁移 — COPY + EXPIRE**

> 不中断服务的情况下迁移 key：COPY 克隆 key 到新名称，再设 TTL 让旧 key 逐渐过期，或直接 UNLINK 异步删除旧 key。适合重构 key 命名规范、数据迁移等场景。

**一键执行：**

```redis
# 1. 克隆到新 key 名
COPY user:1:profile user:profile:1 REPLACE

# 2. 确认新 key 数据无误后，异步删除旧 key
UNLINK user:1:profile

# 3. 或者让旧 key 自然过期
EXPIRE user:1:profile 3600
```

**步骤拆解：**

1. 复制数据到新 key（REPLACE = 目标已存在则覆盖）

   ```redis
   COPY user:1:profile user:profile:1 REPLACE
   ```

2. 验证新 key 数据正确

   ```redis
   GET user:profile:1
   ```

3. 异步删除旧 key（生产安全，不阻塞）

   ```redis
   UNLINK user:1:profile
   ```

4. 或者设置短暂过期作为安全回滚窗口

   ```redis
   EXPIRE user:1:profile 3600
   ```

**标签：** 迁移、COPY、重命名、重构、数据、安全

---

---

## 🔀 Git

### 命令（40 条）

#### basic

**git add**　`低危`

> 将文件更改添加到暂存区——准备提交的中间步骤，是工作区到版本库的桥梁

**语法：**

```bash
git add [options] <pathspec>...
```

**常用参数：**
- `-A / --all`：暂存所有更改（新增 + 修改 + 删除）
- `-u / --update`：只暂存已跟踪文件的修改和删除，不包含新文件
- `-p / --patch`：交互式逐块选择要暂存的更改（精细控制）
- `.`：暂存当前目录及子目录下的所有更改
- `-f / --force`：强制添加被 .gitignore 忽略的文件

**示例：**

1. 暂存所有更改

   ```bash
   git add -A
   ```

2. 暂存指定文件

   ```bash
   git add src/main.js README.md
   ```

3. 交互式暂存（逐块确认）

   ```bash
   git add -p
   ```

**相关命令：** `git commit`、`git status`、`git reset`、`git stash`

**标签：** 添加、暂存、stage、追踪、提交前、索引

---

**git archive**　`低危`

> 将仓库内容打包导出为 tar/zip 文件——不含 .git 目录，用于部署或分发源码

**语法：**

```bash
git archive [options] <tree-ish> [-- <path>...]
```

**常用参数：**
- `--format=tar.gz / -o`：指定输出格式和文件名
- `--output=<file> / -o`：写入到指定文件（而非 stdout）
- `--prefix=<dir>/`：在压缩包中添加目录前缀

**示例：**

1. 导出最新代码为 tar.gz

   ```bash
   git archive --format=tar.gz -o project.tar.gz HEAD
   ```

2. 导出指定版本

   ```bash
   git archive -o v1.0.zip v1.0.0
   ```

**相关命令：** `git tag`、`git clone`、`git bundle`

**标签：** 打包、archive、导出、部署、tar、zip

---

**git clone**　`低危`

> 将远程仓库完整克隆到本地——下载所有文件、提交历史和分支

**语法：**

```bash
git clone [options] <repository-url> [directory]
```

**常用参数：**
- `--branch <name> / -b`：克隆后切换到指定分支
- `--depth <n>`：浅克隆——只拉取最近 n 次提交历史（加速大仓库）
- `--single-branch`：只克隆指定分支
- `--recurse-submodules`：同时初始化和更新子模块

**示例：**

1. 克隆仓库到当前目录

   ```bash
   git clone https://github.com/user/repo.git
   ```

2. 浅克隆最近 10 次提交

   ```bash
   git clone --depth=10 https://github.com/user/repo.git
   ```

3. 克隆指定分支到自定义目录

   ```bash
   git clone -b develop https://github.com/user/repo.git my-folder
   ```

**相关命令：** `git init`、`git remote`、`git fetch`

**标签：** 克隆、下载、远程、复制、拉取、仓库

---

**git commit**　`低危`

> 将暂存区内容创建为一个新的提交——Git 版本控制的核心操作

**语法：**

```bash
git commit [options] [-m <message>]
```

**常用参数：**
- `-m <msg>`：直接指定提交信息
- `-a / --all`：自动暂存所有已跟踪文件的修改并提交（跳过 git add）
- `--amend`：修改上一次提交（追加更改或修改提交信息）
- `--no-edit`：使用上一次的提交信息（常与 --amend 配合）
- `-v / --verbose`：在提交信息编辑器中显示 diff 内容

**示例：**

1. 提交并写提交信息

   ```bash
   git commit -m "fix: resolve login redirect issue"
   ```

2. 修改上一次提交的信息

   ```bash
   git commit --amend -m "new message"
   ```

3. 跳过暂存直接提交所有修改

   ```bash
   git commit -am "quick fix"
   ```

**相关命令：** `git add`、`git status`、`git push`、`git reset`、`git log`

**标签：** 提交、commit、保存、版本、快照、记录

---

**git diff**　`低危`

> 显示文件差异——工作区与暂存区、暂存区与最新提交、或任意两次提交之间

**语法：**

```bash
git diff [options] [<commit>] [--] [<path>...]
```

**常用参数：**
- `--staged / --cached`：显示已暂存但尚未提交的差异
- `<commit1> <commit2>`：比较两次提交之间的差异
- `--stat`：只显示文件变更统计而不显示详细 diff
- `--name-only`：只列出变更的文件名
- `-w`：忽略空白字符差异

**示例：**

1. 查看工作区未暂存的修改

   ```bash
   git diff
   ```

2. 查看已暂存的修改

   ```bash
   git diff --staged
   ```

3. 比较两个分支的差异

   ```bash
   git diff main..feature
   ```

4. 只显示变更文件统计

   ```bash
   git diff --stat HEAD~1
   ```

**相关命令：** `git status`、`git add`、`git log`、`git show`

**标签：** 差异、对比、diff、比较、修改、代码审查

---

**git init**　`低危`

> 初始化一个新的 Git 仓库——在当前目录创建 .git 子目录，包含仓库所需的所有元数据

**语法：**

```bash
git init [--bare] [--initial-branch=<name>] [directory]
```

**常用参数：**
- `--bare`：创建裸仓库（无工作目录，用于远程服务器）
- `--initial-branch=<name>`：指定初始分支名（默认取决于 init.defaultBranch 配置）
- `--template=<dir>`：使用自定义模板目录

**示例：**

1. 在当前目录初始化仓库

   ```bash
   git init
   ```

2. 初始化并指定主分支名为 main

   ```bash
   git init --initial-branch=main my-project
   ```

**相关命令：** `git clone`、`git config`

**标签：** 初始化、创建、仓库、新建、开始、setup

---

**git log**　`低危`

> 查看提交历史——显示提交的 SHA、作者、日期和提交信息，支持丰富的格式化和过滤选项

**语法：**

```bash
git log [options] [<revision-range>]
```

**常用参数：**
- `--oneline`：每个提交一行（SHA + 标题），最紧凑的格式
- `--graph`：用 ASCII 图显示分支和合并历史
- `-n <n>`：只显示最近 n 条提交
- `--author=<pattern>`：只显示指定作者的提交
- `--since/--until`：按日期范围过滤
- `--grep=<pattern>`：在提交信息中搜索关键词
- `-p`：同时显示每个提交的完整 diff
- `-- <path>`：只显示涉及指定文件的提交

**示例：**

1. 查看最近 10 条提交（紧凑模式）

   ```bash
   git log --oneline -10
   ```

2. 查看分支图

   ```bash
   git log --oneline --graph --all
   ```

3. 查看某文件的修改历史

   ```bash
   git log -p -- src/app.js
   ```

4. 搜索包含关键词的提交

   ```bash
   git log --grep="bug fix" --oneline
   ```

**相关命令：** `git show`、`git diff`、`git blame`、`git reflog`

**标签：** 历史、日志、提交记录、log、查看、追溯

---

**git show**　`低危`

> 显示指定对象（提交、标签、分支等）的详细信息——包括提交信息和完整 diff

**语法：**

```bash
git show [options] <object>
```

**常用参数：**
- `--stat`：只显示文件变更统计
- `--name-only`：只显示变更文件名
- `--format=<fmt>`：自定义输出格式

**示例：**

1. 查看最新提交的详细信息

   ```bash
   git show HEAD
   ```

2. 查看指定提交的内容

   ```bash
   git show a1b2c3d
   ```

3. 只显示变更文件列表

   ```bash
   git show --name-only HEAD
   ```

**相关命令：** `git log`、`git diff`、`git cat-file`

**标签：** 查看、显示、提交详情、show、diff

---

**git status**　`低危`

> 显示工作区和暂存区的状态——哪些文件已修改、已暂存、未跟踪

**语法：**

```bash
git status [options]
```

**常用参数：**
- `-s / --short`：简洁输出——每个文件一行，两列分别表示暂存和工作区状态
- `-b / --branch`：同时显示分支信息（与上游的差异）
- `-u / --untracked-files`：控制未跟踪文件的显示（normal/all/no）

**示例：**

1. 查看完整状态

   ```bash
   git status
   ```

2. 简洁模式查看状态

   ```bash
   git status -s
   ```

**相关命令：** `git diff`、`git add`、`git commit`、`git log`

**标签：** 状态、查看、检查、工作区、暂存、诊断

---

#### branch

**git branch**　`中危`

> 创建、列出或删除分支——Git 分支管理的核心命令

**语法：**

```bash
git branch [options] [<branch-name>]
```

**常用参数：**
- `-a / --all`：列出所有分支（包括远程跟踪分支）
- `-r / --remotes`：只列出远程跟踪分支
- `-d / --delete`：删除分支（已合并到 HEAD 的分支）
- `-D`：强制删除分支（即使未合并）
- `-m <old> <new>`：重命名分支
- `-v / --verbose`：显示每个分支的最新提交信息
- `-u <upstream>`：设置当前分支追踪的上游分支

**示例：**

1. 列出本地分支

   ```bash
   git branch
   ```

2. 创建新分支

   ```bash
   git branch feature/login
   ```

3. 删除已合并的分支

   ```bash
   git branch -d feature/login
   ```

4. 重命名当前分支

   ```bash
   git branch -m old-name new-name
   ```

5. 查看所有分支（含远程）

   ```bash
   git branch -av
   ```

**相关命令：** `git checkout`、`git switch`、`git merge`、`git push`

**标签：** 分支、branch、创建、删除、列表、管理

---

**git checkout**　`中危`

> 切换分支或恢复工作区文件——Git 最常用的命令之一，具有分支切换和文件恢复双重功能

**语法：**

```bash
git checkout [options] <branch> | <commit> -- <file>
```

**常用参数：**
- `-b <branch>`：创建新分支并切换到该分支
- `-B <branch>`：创建/重置新分支并切换
- `-- <file>`：从指定提交中恢复文件到工作区
- `--detach`：切换到指定提交（分离 HEAD 状态）

**示例：**

1. 切换到已有分支

   ```bash
   git checkout main
   ```

2. 创建并切换到新分支

   ```bash
   git checkout -b feature/new-dashboard
   ```

3. 撤销某文件的修改（恢复到上一次提交状态）

   ```bash
   git checkout -- app.js
   ```

**相关命令：** `git switch`、`git restore`、`git branch`、`git reset`

**标签：** 切换、checkout、分支、恢复、文件、检出

---

**git cherry-pick**　`中危`

> 将指定提交的修改应用到当前分支——精准搬运单个或一组提交，不改变提交历史

**语法：**

```bash
git cherry-pick [options] <commit>...
```

**常用参数：**
- `-n / --no-commit`：只应用更改到暂存区但不自动提交
- `-x`：在提交信息中附加原始提交的 SHA
- `--continue`：解决冲突后继续
- `--abort`：放弃并恢复到 cherry-pick 前状态

**示例：**

1. 将某个提交搬运到当前分支

   ```bash
   git cherry-pick a1b2c3d
   ```

2. 搬运连续的多个提交

   ```bash
   git cherry-pick a1b2c3d..e4f5g6h
   ```

**相关命令：** `git merge`、`git rebase`、`git revert`

**标签：** cherry-pick、挑选、搬运、提交、移植、补丁

---

**git merge**　`中危`

> 将指定分支的提交合并到当前分支——支持 fast-forward、三方合并和 squash 模式

**语法：**

```bash
git merge [options] <branch>
```

**常用参数：**
- `--no-ff`：即使可以快进也创建合并提交（保留分支历史）
- `--ff-only`：只在可以快进时才合并（安全模式）
- `--squash`：压缩所有更改到暂存区但不自动提交
- `--abort`：放弃合并并恢复到合并前状态
- `-m <msg>`：指定合并提交信息
- `-X theirs / -X ours`：冲突时自动选择对方/己方的版本

**示例：**

1. 将 feature 分支合并到当前分支

   ```bash
   git merge feature/login
   ```

2. 合并并保留分支历史

   ```bash
   git merge --no-ff feature/login
   ```

3. 放弃有冲突的合并

   ```bash
   git merge --abort
   ```

**相关命令：** `git rebase`、`git cherry-pick`、`git branch`、`git log`

**标签：** 合并、merge、分支、整合、fast-forward、冲突

---

**git rebase**　`高危`

> 将当前分支的提交重新应用到另一个分支的顶端——产生线性历史，比 merge 更干净但更危险

**语法：**

```bash
git rebase [options] [<upstream>] [<branch>]
```

**常用参数：**
- `-i / --interactive`：交互式变基——可以压缩、重排、删除、修改提交
- `--onto <newbase>`：将提交移植到新的基点上
- `--continue`：解决冲突后继续变基
- `--abort`：放弃变基并恢复到变基前状态
- `--skip`：跳过当前有冲突的提交
- `-X theirs / -X ours`：冲突时自动选择策略

**示例：**

1. 将当前分支变基到 main

   ```bash
   git rebase main
   ```

2. 交互式变基最近 5 次提交

   ```bash
   git rebase -i HEAD~5
   ```

3. 将 feature 移植到新的基点上

   ```bash
   git rebase --onto main develop feature
   ```

**相关命令：** `git merge`、`git cherry-pick`、`git reflog`、`git reset`

**标签：** 变基、rebase、线性、重写历史、整理、提交

---

**git restore**　`中危`

> 恢复工作区文件——Git 2.23+ 引入，用于替代 git checkout 的文件恢复功能，语义更清晰

**语法：**

```bash
git restore [options] <pathspec>...
```

**常用参数：**
- `-S / --staged`：从暂存区恢复（取消暂存）
- `-W / --worktree`：恢复工作区文件（默认）
- `-s <tree> / --source=<tree>`：从指定提交/分支恢复

**示例：**

1. 丢弃工作区的修改（恢复到暂存状态）

   ```bash
   git restore app.js
   ```

2. 从暂存区移出（取消 git add）

   ```bash
   git restore --staged app.js
   ```

3. 从指定提交恢复文件

   ```bash
   git restore --source=HEAD~2 app.js
   ```

**相关命令：** `git checkout`、`git switch`、`git reset`、`git stash`

**标签：** 恢复、restore、撤销、文件、丢弃、2.23

---

**git revert**　`中危`

> 创建一个新提交来撤销指定提交的更改——安全的撤销方式，不重写历史，适合已推送的提交

**语法：**

```bash
git revert [options] <commit>...
```

**常用参数：**
- `-n / --no-commit`：只应用撤销到暂存区但不自动提交
- `-m <parent>`：撤销合并提交时需指定保留哪一侧的父提交（通常用 -m 1）
- `--continue`：解决冲突后继续

**示例：**

1. 撤销某个提交

   ```bash
   git revert a1b2c3d
   ```

2. 撤销合并提交

   ```bash
   git revert -m 1 <merge-commit>
   ```

**相关命令：** `git reset`、`git cherry-pick`、`git log`

**标签：** 撤销、revert、回滚、安全、历史

---

**git switch**　`低危`

> 切换到指定分支——Git 2.23+ 引入，比 checkout 更专注，纯分支切换不涉及文件恢复

**语法：**

```bash
git switch [options] <branch>
```

**常用参数：**
- `-c <branch>`：创建新分支并切换过去
- `-C <branch>`：强制创建新分支并切换（覆盖已有）
- `--detach`：切换到指定提交（分离 HEAD）
- `- / --discard-changes`：放弃本地修改后切换

**示例：**

1. 切换到已有分支

   ```bash
   git switch main
   ```

2. 创建并切换到新分支

   ```bash
   git switch -c feature/new-api
   ```

3. 返回上一个分支

   ```bash
   git switch -
   ```

**相关命令：** `git checkout`、`git restore`、`git branch`

**标签：** 切换、switch、分支、2.23

---

**git worktree**　`低危`

> 管理多个工作目录——同一仓库同时 checkout 到不同文件夹，免去来回切换分支的麻烦

**语法：**

```bash
git worktree <add | list | remove | prune> [options]
```

**常用参数：**
- `add <path> <branch>`：在新路径检出指定分支（创建一个新的工作目录）
- `add -b <branch> <path>`：创建新分支并在新路径检出
- `list`：列出所有工作目录
- `remove <path>`：删除工作目录（分支必须已合并）
- `prune`：清理已不存在的工作目录记录

**示例：**

1. 在 ../project-hotfix 目录检出 hotfix 分支

   ```bash
   git worktree add ../project-hotfix hotfix
   ```

2. 查看所有工作目录

   ```bash
   git worktree list
   ```

3. 删除 worktree（先确认已合并）

   ```bash
   git worktree remove ../project-hotfix
   ```

**相关命令：** `git branch`、`git checkout`、`git switch`、`git stash`

**标签：** 工作树、worktree、多分支、并行、切换

---

#### config

**git config**　`中危`

> 读取和设置 Git 配置——用户信息、别名、编辑器、合并策略等，支持本地(仓库)、全局和系统三级作用域

**语法：**

```bash
git config [options] [<key> [<value>]]
```

**常用参数：**
- `--global`：读写全局配置（~/.gitconfig，对所有仓库生效）
- `--local`：读写当前仓库配置（默认）
- `--list / -l`：列出所有配置项
- `--get <key>`：获取指定配置项的值
- `--unset <key>`：移除指定配置项
- `--edit / -e`：在编辑器中打开配置文件
- `alias.<name> <command>`：为 Git 命令创建别名

**示例：**

1. 设置全局用户名和邮箱

   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "you@example.com"
   ```

2. 创建常用别名

   ```bash
   git config --global alias.co checkout
   git config --global alias.br branch
   ```

3. 查看所有配置

   ```bash
   git config --list
   ```

**相关命令：** `git init`、`git help`

**标签：** 配置、config、设置、用户、别名、全局

---

**git help**　`低危`

> 显示 Git 命令的帮助文档——支持命令行、HTML 和 man 页面格式

**语法：**

```bash
git help [options] <command>
```

**常用参数：**
- `-a / --all`：列出所有可用命令（包括不那么常用的）
- `-g / --guides`：列出 Git 概念指南
- `-w / --web`：在浏览器中打开 HTML 版帮助

**示例：**

1. 查看 rebase 的帮助

   ```bash
   git help rebase
   ```

2. 列出所有命令

   ```bash
   git help -a
   ```

**相关命令：** `git config`、`git --help`

**标签：** 帮助、help、文档、手册、man

---

#### inspect

**git bisect**　`低危`

> 二分查找定位引入 bug 的提交——标记好和坏的版本，Git 自动二分搜索缩小范围到你最早引入问题的那个 commit

**语法：**

```bash
git bisect <start | bad | good | skip | reset | run>
```

**常用参数：**
- `start`：开始二分查找
- `bad [<rev>]`：标记当前版本（或指定版本）为有问题
- `good [<rev>]`：标记当前版本（或指定版本）为正常
- `skip [<rev>]`：跳过当前版本（无法判断时）
- `reset`：退出二分模式并回到原始 HEAD
- `run <command>`：自动执行测试脚本判断好坏（全自动 bisect）

**示例：**

1. 开始二分查找

   ```bash
   git bisect start
   ```

2. 标记当前版本为有问题

   ```bash
   git bisect bad
   ```

3. 标记某个旧版本为正常

   ```bash
   git bisect good v1.0.0
   ```

4. 用脚本自动二分查找

   ```bash
   git bisect run npm test
   ```

5. 退出二分模式

   ```bash
   git bisect reset
   ```

**相关命令：** `git log`、`git blame`、`git show`

**标签：** 二分、bisect、排查、bug、定位、调试

---

**git blame**　`低危`

> 逐行显示文件的修改者和提交信息——追溯每一行代码的来源，利于排查问题和 Code Review

**语法：**

```bash
git blame [options] <file>
```

**常用参数：**
- `-L <start>,<end>`：只显示指定行范围（如 -L 10,50 或 -L /regex/）
- `-w`：忽略空白字符变更
- `-M`：检测行在文件内部的移动
- `-C`：检测行来自其他文件的复制/移动

**示例：**

1. 查看文件每行的作者和提交

   ```bash
   git blame src/app.js
   ```

2. 只看指定行范围

   ```bash
   git blame -L 100,200 src/app.js
   ```

**相关命令：** `git log`、`git show`、`git diff`

**标签：** 追溯、blame、作者、逐行、历史、排查

---

**git grep**　`低危`

> 在 Git 追踪的文件中搜索匹配的文本——比普通 grep 更快且支持 Git 版本范围

**语法：**

```bash
git grep [options] <pattern>
```

**常用参数：**
- `-i / --ignore-case`：忽略大小写
- `-n`：显示行号
- `-l / --name-only`：只输出包含匹配的文件名
- `-c / --count`：只输出每个文件的匹配次数
- `--cached`：只在暂存区中搜索
- `<revision>`：在指定版本中搜索

**示例：**

1. 搜索 TODO 注释

   ```bash
   git grep -n "TODO"
   ```

2. 忽略大小写搜索函数定义

   ```bash
   git grep -in "function fetchUser"
   ```

3. 只列出包含关键字的文件

   ```bash
   git grep -l "deprecated"
   ```

**相关命令：** `git log`、`git blame`、`git show`

**标签：** 搜索、grep、查找、文本、正则、代码

---

**git range-diff**　`低危`

> 比较两个提交范围之间的差异——常用于 rebase 后验证是否引入了意外变更

**语法：**

```bash
git range-diff [options] <range1> <range2>
```

**常用参数：**
- `--creation-factor=<n>`：调整匹配精度（默认 60，越高越严格）

**示例：**

1. 比较 rebase 前后的提交变化

   ```bash
   git range-diff main..feature main..feature-rebased
   ```

2. 验证 force push 前后差异

   ```bash
   git range-diff origin/feature@{1} origin/feature
   ```

**相关命令：** `git rebase`、`git diff`、`git log`

**标签：** 对比、range-diff、rebase、验证、范围

---

**git reflog**　`低危`

> 查看本地 HEAD 和分支引用的变更历史——记录你所有的 checkout、commit、reset 等操作，是误操作后的救命稻草

**语法：**

```bash
git reflog [show] [<ref>]
```

**常用参数：**
- `<ref>`：查看指定引用的 reflog（默认为 HEAD）
- `--expire=<time>`：清理超过指定时间的 reflog 条目
- `expire`：手动清理旧 reflog

**示例：**

1. 查看 HEAD 的变更历史

   ```bash
   git reflog
   ```

2. 回退到误删分支前的状态

   ```bash
   git checkout HEAD@{2}
   ```

3. 恢复被 git reset --hard 毁掉的提交

   ```bash
   git reset --hard HEAD@{1}
   ```

**相关命令：** `git reset`、`git log`、`git branch`

**标签：** reflog、日志、恢复、救援、HEAD、历史

---

**git rev-list**　`低危`

> 列出符合条件的提交 SHA——支持强大的过滤选项，是高级 git log 的底层命令

**语法：**

```bash
git rev-list [options] <commit>...
```

**常用参数：**
- `--count`：只返回提交数量
- `--since/--until`：按日期过滤
- `--author=<pattern>`：按作者过滤
- `--diff-filter=D -- <path>`：查找删除指定文件的提交
- `--max-count=<n>`：最多返回 n 个提交

**示例：**

1. 统计两个版本间的提交数

   ```bash
   git rev-list --count v1.0..v2.0
   ```

2. 查找删除某文件的所有提交

   ```bash
   git rev-list HEAD --diff-filter=D -- app.js
   ```

**相关命令：** `git log`、`git blame`、`git bisect`

**标签：** 列表、rev-list、SHA、过滤、高级、查询

---

**git shortlog**　`低危`

> 按作者分组统计提交数量和标题——用于生成 release notes 或查看团队贡献

**语法：**

```bash
git shortlog [options] [<revision-range>]
```

**常用参数：**
- `-s / --summary`：只显示提交数量不显示标题
- `-n / --numbered`：按提交数量排序
- `-e / --email`：同时显示邮箱

**示例：**

1. 按作者统计提交数（用于 release note）

   ```bash
   git shortlog -sn
   ```

2. 查看某版本的贡献者统计

   ```bash
   git shortlog -sn v1.0.0..v2.0.0
   ```

**相关命令：** `git log`、`git blame`、`git describe`

**标签：** 统计、shortlog、作者、release、贡献、汇总

---

#### remote

**git fetch**　`低危`

> 从远程仓库下载最新数据但不合并——安全地查看远程更新，不影响本地工作

**语法：**

```bash
git fetch [options] [<remote>] [<branch>]
```

**常用参数：**
- `--all`：从所有远程仓库获取
- `-p / --prune`：同时清理本地已删除的远程分支引用
- `--tags`：同时获取所有标签

**示例：**

1. 从默认远程获取最新数据

   ```bash
   git fetch
   ```

2. 获取并清理已删除的远程分支

   ```bash
   git fetch --prune
   ```

**相关命令：** `git pull`、`git push`、`git remote`、`git merge`

**标签：** 获取、fetch、远程、下载、更新、拉取

---

**git pull**　`中危`

> 拉取远程仓库的更新并合并到当前分支——等价于 git fetch + git merge（或 git rebase）

**语法：**

```bash
git pull [options] [<remote>] [<branch>]
```

**常用参数：**
- `-r / --rebase`：使用 rebase 而非 merge 整合远程更新（产生线性历史）
- `--ff-only`：只在可以快进时才合并（拒绝产生合并提交）
- `--no-commit`：合并后暂存但不自动提交

**示例：**

1. 拉取并合并远程更新

   ```bash
   git pull
   ```

2. 使用 rebase 模式拉取

   ```bash
   git pull --rebase
   ```

**相关命令：** `git fetch`、`git merge`、`git push`、`git rebase`

**标签：** 拉取、pull、远程、更新、同步、合并

---

**git push**　`中危`

> 将本地提交推送到远程仓库——同步你的更改供团队使用

**语法：**

```bash
git push [options] [<remote>] [<branch>]
```

**常用参数：**
- `-u <remote> <branch>`：推送并设置上游追踪（后续直接 git push）
- `-f / --force`：强制推送（覆盖远程历史，⚠️慎用！）
- `--force-with-lease`：安全的强制推送——仅当远程分支未被他人更新时才推送
- `--delete <branch>`：删除远程分支
- `--tags`：推送所有本地标签到远程
- `--all`：推送所有分支

**示例：**

1. 推送到远程

   ```bash
   git push
   ```

2. 首次推送并设置上游

   ```bash
   git push -u origin main
   ```

3. 删除远程分支

   ```bash
   git push --delete origin feature/old-branch
   ```

4. 安全的强制推送

   ```bash
   git push --force-with-lease
   ```

**相关命令：** `git pull`、`git fetch`、`git remote`、`git branch`

**标签：** 推送、push、远程、上传、同步、发布

---

**git remote**　`中危`

> 管理远程仓库连接——添加、删除、重命名、查看远程仓库的 URL 映射

**语法：**

```bash
git remote [options] <subcommand> [arguments]
```

**常用参数：**
- `add <name> <url>`：添加新的远程仓库
- `remove <name>`：删除远程仓库
- `rename <old> <new>`：重命名远程仓库
- `set-url <name> <url>`：修改远程仓库的 URL
- `-v / --verbose`：显示远程仓库的 URL（fetch + push）
- `show <name>`：显示指定远程仓库的详细信息
- `prune <name>`：清理本地已不存在的远程分支引用

**示例：**

1. 查看所有远程仓库

   ```bash
   git remote -v
   ```

2. 添加远程仓库

   ```bash
   git remote add origin https://github.com/user/repo.git
   ```

3. 修改远程 URL（从 HTTPS 切到 SSH）

   ```bash
   git remote set-url origin git@github.com:user/repo.git
   ```

**相关命令：** `git fetch`、`git pull`、`git push`、`git clone`

**标签：** 远程、remote、仓库、URL、管理、连接

---

**git submodule**　`中危`

> 管理 Git 子模块——在一个仓库中嵌套引用另一个仓库，适用于共享库、第三方依赖等

**语法：**

```bash
git submodule <add | update | init | deinit | status | foreach> [options]
```

**常用参数：**
- `add <url> [path]`：添加新的子模块
- `update --init --recursive`：初始化和更新所有子模块（克隆新仓库时常用）
- `update --remote`：更新子模块到远程最新提交
- `deinit <path>`：取消子模块注册（保留工作区文件）
- `status`：查看子模块状态
- `foreach <command>`：在每个子模块中执行指定命令

**示例：**

1. 添加子模块

   ```bash
   git submodule add https://github.com/lib/common.git libs/common
   ```

2. 克隆含子模块的仓库后初始化

   ```bash
   git submodule update --init --recursive
   ```

3. 一键更新所有子模块

   ```bash
   git submodule update --remote --recursive
   ```

**相关命令：** `git clone`、`git remote`、`git init`

**标签：** 子模块、submodule、依赖、嵌套、仓库、共享

---

#### stash-undo

**git clean**　`高危`

> 删除工作区中所有未跟踪的文件和目录——清理构建产物、临时文件等

**语法：**

```bash
git clean [options]
```

**常用参数：**
- `-n / --dry-run`：预览将被删除的文件（不实际删除，强烈建议先运行）
- `-f / --force`：强制删除（必须指定才能执行）
- `-d`：同时删除未跟踪的目录
- `-x`：同时删除 .gitignore 中忽略的文件（如 node_modules）

**示例：**

1. 预览将被清理的文件

   ```bash
   git clean -n
   ```

2. 删除所有未跟踪文件

   ```bash
   git clean -fd
   ```

3. 连同被忽略的文件一起清理

   ```bash
   git clean -fdx
   ```

**相关命令：** `git reset`、`git stash`、`git status`

**标签：** 清理、clean、删除、未跟踪、磁盘、干净

---

**git mv**　`低危`

> 移动或重命名文件并自动暂存——等价于 mv + git rm + git add

**语法：**

```bash
git mv [options] <source> <destination>
```

**常用参数：**
- `-f / --force`：强制覆盖目标文件

**示例：**

1. 重命名文件

   ```bash
   git mv old-name.js new-name.js
   ```

2. 移动文件到目录

   ```bash
   git mv utils.js src/utils/
   ```

**相关命令：** `git rm`、`git add`、`git status`

**标签：** 移动、重命名、mv、文件、暂存

---

**git reset**　`高危`

> 重置当前 HEAD 到指定状态——可以撤销提交、取消暂存或丢弃工作区修改，⚠️ 操作不可逆

**语法：**

```bash
git reset [options] [<commit>]
```

**常用参数：**
- `--soft`：只移动 HEAD，保留暂存区和工作区的修改
- `--mixed`：移动 HEAD 并重置暂存区，但保留工作区修改（默认）
- `--hard`：移动 HEAD 并重置暂存区和工作区——⚠️所有修改将永久丢失！
- `HEAD~n`：回退 n 次提交
- `-- <file>`：从暂存区移除指定文件（取消 git add）

**示例：**

1. 撤销最后一次提交但保留修改（安全）

   ```bash
   git reset --soft HEAD~1
   ```

2. 取消所有暂存

   ```bash
   git reset
   ```

3. 完全回退到某次提交（⚠️丢失后续修改）

   ```bash
   git reset --hard a1b2c3d
   ```

4. 取消指定文件的暂存

   ```bash
   git reset HEAD app.js
   ```

**相关命令：** `git revert`、`git reflog`、`git checkout`、`git restore`

**标签：** 重置、reset、撤销、危险、HEAD、回退

---

**git rm**　`中危`

> 从工作区和暂存区中删除文件并暂存删除操作——等价于 rm + git add

**语法：**

```bash
git rm [options] <file>...
```

**常用参数：**
- `-r`：递归删除目录
- `--cached`：只从 Git 追踪中移除但保留磁盘文件（转为未跟踪）
- `-f / --force`：强制删除（用于文件已被修改的情况）

**示例：**

1. 删除文件（从 Git 和磁盘）

   ```bash
   git rm old-file.txt
   ```

2. 停止追踪但保留文件

   ```bash
   git rm --cached config.local.js
   ```

**相关命令：** `git mv`、`git add`、`git reset`

**标签：** 删除、rm、移除、文件、暂存

---

**git stash**　`低危`

> 暂存当前工作区的修改并恢复到干净状态——临时保存未完成的更改，稍后可恢复

**语法：**

```bash
git stash [push | list | pop | apply | drop | show] [options]
```

**常用参数：**
- `push`：将当前修改保存到暂存栈（默认子命令）
- `push -m "msg"`：带描述信息地暂存
- `push -u / --include-untracked`：同时暂存未跟踪的文件
- `list`：列出所有暂存项
- `pop [stash@{n}]`：恢复最近的暂存并删除它
- `apply [stash@{n}]`：恢复暂存但保留它（不删除）
- `drop [stash@{n}]`：删除指定暂存项
- `show [stash@{n}]`：查看暂存的详细 diff

**示例：**

1. 暂存当前修改

   ```bash
   git stash
   ```

2. 暂存并加描述

   ```bash
   git stash push -m "wip: half-done feature"
   ```

3. 查看暂存列表

   ```bash
   git stash list
   ```

4. 恢复最近的暂存

   ```bash
   git stash pop
   ```

**相关命令：** `git reset`、`git checkout`、`git restore`、`git clean`

**标签：** 暂存、stash、保存、临时、工作区、暂缓

---

**git update-index**　`中危`

> 修改 Git 索引（暂存区）状态——常用于临时忽略已追踪文件的本地修改，避免误提交配置文件

**语法：**

```bash
git update-index [options] <file>...
```

**常用参数：**
- `--assume-unchanged`：假设文件未修改——本地改动不会被 git status 看到也不会被提交
- `--no-assume-unchanged`：取消 --assume-unchanged，恢复追踪
- `--skip-worktree`：更彻底的本地忽略标记（推荐用于本地配置）
- `--no-skip-worktree`：取消 --skip-worktree

**示例：**

1. 临时忽略某个配置文件的本地修改

   ```bash
   git update-index --assume-unchanged config/database.yml
   ```

2. 恢复追踪

   ```bash
   git update-index --no-assume-unchanged config/database.yml
   ```

**相关命令：** `git status`、`git stash`、`git rm --cached`、`git add`

**标签：** 索引、忽略、本地、配置、暂存、假设不变

---

#### tag

**git describe**　`低危`

> 显示离当前提交最近的标签——常用于生成版本号或验证当前代码基于哪个 tag

**语法：**

```bash
git describe [options] [<commit>]
```

**常用参数：**
- `--tags`：使用所有标签（不仅仅是带注释的）
- `--always`：没有标签时显示缩写的 SHA
- `--dirty`：工作区有未提交修改时追加 -dirty 后缀

**示例：**

1. 查看当前提交最接近的标签

   ```bash
   git describe --tags
   ```

2. 生成含修改标记的描述

   ```bash
   git describe --tags --dirty
   ```

**相关命令：** `git tag`、`git log`、`git rev-parse`

**标签：** 标签、describe、版本号、tag、距离

---

**git tag**　`低危`

> 创建、列出或删除标签——用于标记发布版本（如 v1.0.0），支持轻量标签和附注标签

**语法：**

```bash
git tag [options] [<tagname>] [<commit>]
```

**常用参数：**
- `-a <tagname> -m "msg"`：创建附注标签（含作者、日期和说明信息，推荐用于发布）
- `-l / --list "pattern"`：按模式列出标签
- `-d <tagname>`：删除本地标签
- `-f <tagname>`：强制覆盖已有标签
- `-s <tagname>`：创建 GPG 签名的标签

**示例：**

1. 列出所有标签

   ```bash
   git tag
   ```

2. 创建附注标签

   ```bash
   git tag -a v1.0.0 -m "First stable release"
   ```

3. 推送标签到远程

   ```bash
   git push origin v1.0.0
   ```

4. 删除标签

   ```bash
   git tag -d v0.0.1
   ```

**相关命令：** `git push`、`git show`、`git branch`

**标签：** 标签、tag、版本、发布、release、标记

---

### 配方（23 个）

#### 📋 配方 · 撤销最后一次提交（保留修改）

**撤销最后一次提交（保留修改）**

> 撤销最后一次 git commit，但保留所有修改在工作区——适合刚刚提交完发现漏了东西或提交信息写错的情况。

**一键执行：**

```bash
# 撤销提交，修改回到暂存区
git reset --soft HEAD~1

# 如果需要修改提交信息，修改后重新提交
git commit -m "new message"
```

**步骤拆解：**

1. 撤销最近一次提交，修改回到暂存区（安全，不丢代码）

   ```bash
   git reset --soft HEAD~1
   ```

2. 修改文件后重新暂存

   ```bash
   git add .
   ```

3. 重新提交

   ```bash
   git commit -m "corrected message"
   ```

**标签：** 撤销、reset、提交、安全、soft

---

#### 📋 配方 · 修改最近一次提交 — commit --amend

**修改最近一次提交 — commit --amend**

> 快速修改最近一次提交——无论是追加遗漏的文件还是修改提交信息。注意：只能修改未推送的提交。

**一键执行：**

```bash
# 追加修改到上一次提交
git add forgotten-file.js
git commit --amend --no-edit

# 或只修改提交信息
git commit --amend -m "new message"
```

**步骤拆解：**

1. 先暂存遗漏的修改

   ```bash
   git add forgotten-file.js
   ```

2. 追加到上一次提交（保持原提交信息）

   ```bash
   git commit --amend --no-edit
   ```

3. 如果只想改提交信息而不改内容

   ```bash
   git commit --amend -m "修正后的提交信息"
   ```

**标签：** amend、提交、修改、追加、修正

---

#### 📋 配方 · 交互式合并提交 — rebase -i 压缩

**交互式合并提交 — rebase -i 压缩**

> 使用交互式 rebase 将多个零散提交压缩成一个干净提交——在推送前整理提交历史的常用操作。

**一键执行：**

```bash
# 压缩最近 3 次提交
git rebase -i HEAD~3

# 在编辑器中：保留第一个 pick，其余改为 squash (s)
# pick a1b2c3d first commit
# squash d4e5f6g second commit
# squash h7i8j9k third commit

# 保存后编辑合并后的提交信息
```

**步骤拆解：**

1. 进入交互式 rebase（最近 N 次提交）

   ```bash
   git rebase -i HEAD~3
   ```

2. 在编辑器中：第一个保持 pick，其余改为 squash 或 s

   ```bash
   # pick a1b2c3d 保留第一个
   # s d4e5f6g 合并到上一个
   # s h7i8j9k 合并到上一个
   ```

3. 保存退出后编辑合并后的提交信息

   ```bash
   # 在第二个编辑器中编写最终的提交信息
   ```

4. 如果冲突，解决后继续

   ```bash
   git rebase --continue
   ```

**标签：** rebase、squash、压缩、整理、历史、清理

---

#### 📋 配方 · 抢救误删分支 — reflog 救援

**抢救误删分支 — reflog 救援**

> 误删分支后用 reflog 找回丢失的提交——reflog 记录了所有 HEAD 变动，即使 branch -D 了也能恢复。

**一键执行：**

```bash
# 查看 HEAD 的所有历史变动
git reflog

# 找到被删除分支指向的最后一次提交 SHA
git branch recovered-branch HEAD@{3}

# 或直接恢复该提交
git checkout -b recovered-branch a1b2c3d
```

**步骤拆解：**

1. 查看 HEAD 变更历史（找到你最后一次在那个分支上的位置）

   ```bash
   git reflog
   ```

2. 从 reflog 中找到目标提交（如 HEAD@{3}），创建新分支恢复

   ```bash
   git branch recovered-branch HEAD@{3}
   ```

3. 切换过去确认数据完好

   ```bash
   git checkout recovered-branch
   ```

**标签：** reflog、恢复、误删、救援、分支、提交

---

#### 📋 配方 · 临时保存工作 — stash 暂存

**临时保存工作 — stash 暂存**

> 工作中被打断需要切换分支时：stash 暂存当前修改 → 切换分支处理 → 回来 stash pop 恢复。

**一键执行：**

```bash
# 暂存当前所有修改
git stash push -m "WIP: refactoring auth module"

# 切换分支处理紧急事务
git checkout hotfix
# ... 修复并提交 ...

# 回到原分支恢复工作
git checkout feature/auth
git stash pop
```

**步骤拆解：**

1. 暂存当前工作区的所有修改

   ```bash
   git stash push -m "WIP: refactoring auth module"
   ```

2. 切换分支处理其他事情

   ```bash
   git checkout hotfix
   ```

3. 回来恢复暂存的修改

   ```bash
   git checkout feature/auth
   git stash pop
   ```

4. 如果有多个 stash 项，先查看列表

   ```bash
   git stash list
   ```

**标签：** stash、暂存、打断、切换、恢复

---

#### 📋 配方 · cherry-pick 跨分支搬运

**cherry-pick 跨分支搬运**

> 将某个分支上的特定提交搬运到当前分支——不需要合并整个分支，只取需要的提交。

**一键执行：**

```bash
# 先找到要搬运的提交 SHA
git log --oneline feature/other

# 搬运单个提交
git cherry-pick a1b2c3d

# 搬运连续的多个提交
git cherry-pick a1b2c3d..e4f5g6h
```

**步骤拆解：**

1. 找到要搬运的提交 SHA

   ```bash
   git log --oneline feature/other
   ```

2. 将指定提交应用到当前分支

   ```bash
   git cherry-pick a1b2c3d
   ```

3. 如有冲突，解决后继续

   ```bash
   git cherry-pick --continue
   ```

4. 如果不想要了，放弃整个 cherry-pick

   ```bash
   git cherry-pick --abort
   ```

**标签：** cherry-pick、搬运、提交、跨分支、移植

---

#### 📋 配方 · 分支清理 — 删除已合并分支

**分支清理 — 删除已合并分支**

> 定期清理本地和远程已合并的分支，保持仓库整洁。

**一键执行：**

```bash
# 查看已合并到 main 的分支
git branch --merged main

# 批量删除本地已合并分支（排除 main 和 develop）
git branch --merged main | grep -v 'main\|develop' | xargs git branch -d

# 清理本地已不存在的远程分支引用
git fetch --prune
```

**步骤拆解：**

1. 列出已合并到 main 的分支（确认无误）

   ```bash
   git branch --merged main
   ```

2. 删除已合并的本地分支（排除 main/develop）

   ```bash
   git branch --merged main | grep -v 'main\|develop' | xargs git branch -d
   ```

3. 清理远程已删除的分支引用

   ```bash
   git fetch --prune
   ```

**标签：** 分支、清理、删除、合并、整洁

---

#### 📋 配方 · 首次推送新仓库 — init + push -u

**首次推送新仓库 — init + push -u**

> 将本地新项目推送到 GitHub/GitLab 远程仓库的完整流程——从初始化到首次推送。

**一键执行：**

```bash
# 本地初始化
git init --initial-branch=main
git add -A
git commit -m "Initial commit"

# 关联远程并推送
git remote add origin https://github.com/user/repo.git
git push -u origin main
```

**步骤拆解：**

1. 初始化仓库并指定主分支为 main

   ```bash
   git init --initial-branch=main
   ```

2. 暂存所有文件并首次提交

   ```bash
   git add -A
   git commit -m "Initial commit"
   ```

3. 添加远程仓库

   ```bash
   git remote add origin https://github.com/user/repo.git
   ```

4. 推送并设置上游追踪

   ```bash
   git push -u origin main
   ```

**标签：** 初始化、推送、远程、首次、setup

---

#### 📋 配方 · 撤销已推送的提交 — revert（安全回滚）

**撤销已推送的提交 — revert（安全回滚）**

> 线上代码需要回滚时，用 git revert 创建反向提交——不改写历史，团队协作安全。⚠️ 切勿对已推送的提交使用 git reset --hard + force push。

**一键执行：**

```bash
# 撤销单个已推送的提交
git revert a1b2c3d

# 提交并推送
git push

# 撤销多个连续提交（注意顺序：最新的先撤销）
git revert HEAD~3..HEAD
```

**步骤拆解：**

1. 找到要撤销的提交 SHA

   ```bash
   git log --oneline -5
   ```

2. revert 该提交（产生新提交，不改历史）

   ```bash
   git revert a1b2c3d
   ```

3. 如果有冲突，解决后继续

   ```bash
   git revert --continue
   ```

4. 推送到远程

   ```bash
   git push
   ```

**标签：** revert、回滚、撤销、安全、线上、推送

---

#### 📋 配方 · 从历史中恢复误删文件

**从历史中恢复误删文件**

> 文件被误删并提交了？只要曾经提交过就能从 Git 历史中找回——用 checkout 或 restore 从旧版本中恢复。

**一键执行：**

```bash
# 1. 找到该文件最后一次存在的提交
git log --diff-filter=D --oneline -- deleted-file.txt

# 2. 从删除前的那个提交恢复文件
git checkout <commit-before-delete> -- deleted-file.txt

# 或使用 restore（Git 2.23+）
git restore --source=<commit-before-delete> deleted-file.txt
```

**步骤拆解：**

1. 查找删除该文件的提交

   ```bash
   git log --diff-filter=D --oneline -- deleted-file.txt
   ```

2. 从删除前的提交中恢复文件

   ```bash
   git checkout a1b2c3d^ -- deleted-file.txt
   ```

3. 提交恢复

   ```bash
   git add deleted-file.txt
   git commit -m "recover deleted-file.txt"
   ```

**标签：** 恢复、文件、误删、checkout、历史、找回

---

#### 📋 配方 · 同步 Fork 仓库 — upstream 更新

**同步 Fork 仓库 — upstream 更新**

> 你在 GitHub 上 fork 的仓库落后于原始仓库时，添加 upstream 远程并合并更新——保持 fork 与上游同步。

**一键执行：**

```bash
# 1. 添加原始仓库为 upstream（只需一次）
git remote add upstream https://github.com/original/repo.git

# 2. 拉取上游最新代码
git fetch upstream

# 3. 切换到 main 并合并上游
git checkout main
git merge upstream/main

# 4. 推送到自己的 fork
git push origin main
```

**步骤拆解：**

1. 添加上游仓库为 remote（只需执行一次）

   ```bash
   git remote add upstream https://github.com/original/repo.git
   ```

2. 拉取上游所有更新

   ```bash
   git fetch upstream
   ```

3. 合并上游 main 到本地 main

   ```bash
   git checkout main
   git merge upstream/main
   ```

4. 推送到自己的 fork

   ```bash
   git push origin main
   ```

**标签：** fork、upstream、同步、远程、更新

---

#### 📋 配方 · 解决合并冲突 — 完整流程

**解决合并冲突 — 完整流程**

> merge 或 rebase 时遇到冲突不要慌——先定位冲突文件，再手动或用 mergetool 解决，最后标记完成。推荐使用 git mergetool（自动调起 VS Code 等可视化工具）。

**一键执行：**

```bash
# 1. 查看冲突文件列表
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
git rebase --continue              # 仅 rebase 冲突时使用
```

**步骤拆解：**

1. 查看哪些文件有冲突

   ```bash
   git status
   ```

2. 方式一：手动编辑冲突文件，删除 <<<<<<< / ======= / >>>>>>> 标记

   ```bash
   # 打开文件，保留需要的内容，删除冲突标记行
   ```

3. 方式二：用可视化工具解决（推荐，自动调起 VS Code/vimdiff 等）

   ```bash
   git mergetool
   ```

4. 标记冲突已解决

   ```bash
   git add resolved-file.js
   ```

5. 结束合并——git commit（传统）或 git merge --continue（Git 2.22+），rebase 冲突则用 git rebase --continue

   ```bash
   git commit  # 或 git merge --continue (Git 2.22+)
   ```

**标签：** 冲突、merge、conflict、解决、mergetool

---

#### 📋 配方 · 忽略已追踪文件的本地修改

**忽略已追踪文件的本地修改**

> 有些配置文件（如 database.yml）需要本地修改但不能提交——用 update-index --skip-worktree 让 Git 假装文件没动过。

**一键执行：**

```bash
# 告诉 Git 忽略此文件的本地修改
git update-index --skip-worktree config/database.yml

# 查看被 skip-worktree 标记的文件
git ls-files -v | grep '^S'

# 恢复追踪（需要提交本地修改时）
git update-index --no-skip-worktree config/database.yml
```

**步骤拆解：**

1. 标记文件为跳过工作树更新

   ```bash
   git update-index --skip-worktree config/database.yml
   ```

2. 查看当前被标记的文件

   ```bash
   git ls-files -v | grep '^S'
   ```

3. 恢复对该文件的追踪

   ```bash
   git update-index --no-skip-worktree config/database.yml
   ```

**标签：** 忽略、本地、配置、skip-worktree、环境、保密

---

#### 📋 配方 · 精细暂存 — git add -p 部分提交

**精细暂存 — git add -p 部分提交**

> 一个文件改了 10 处，只想提交其中 3 处——git add -p 逐块确认，把一个大修改拆成多个语义清晰的提交。

**一键执行：**

```bash
# 交互式逐块暂存
git add -p

# 逐块操作提示：
# y - 暂存此块
# n - 跳过此块
# s - 拆分成更小的块
# e - 手动编辑此块
# q - 退出
```

**步骤拆解：**

1. 启动交互式暂存

   ```bash
   git add -p src/app.js
   ```

2. 对每个修改块确认：y=暂存 n=跳过 s=拆分 e=编辑 q=退出

   ```bash
   # 按 y 暂存当前修改块，按 n 跳过
   ```

3. 提交已选择的修改

   ```bash
   git commit -m "第一部分：重构 API 层"
   ```

4. 再次 add -p 提交剩余修改

   ```bash
   git add -p
   git commit -m "第二部分：优化渲染逻辑"
   ```

**标签：** add -p、暂存、精细、拆分、提交、交互

---

#### 📋 配方 · 压缩整个分支为一个提交 — reset --soft

**压缩整个分支为一个提交 — reset --soft**

> 分支上零零散散 30 个提交，合并前想压缩成一个干净提交——用 reset --soft 回到 main，再新建一个包含所有修改的提交。

**一键执行：**

```bash
# 方法：回到 main，soft reset，重新提交
git checkout feature/xyz
git reset --soft main
git commit -m "feat: add user dashboard with real-time stats"

# 等效于：把所有零散提交压缩为一个有意义的提交
```

**步骤拆解：**

1. 确保当前在要压缩的分支上

   ```bash
   git checkout feature/xyz
   ```

2. soft reset 到 main——修改全部回到暂存区，但提交记录消失

   ```bash
   git reset --soft main
   ```

3. 查看暂存区内容确认无误

   ```bash
   git status
   ```

4. 新建一个干净提交

   ```bash
   git commit -m "feat: complete feature description"
   ```

5. （可选）强制推送到远程（⚠️如已存在远程分支需 --force）

   ```bash
   git push --force-with-lease origin feature/xyz
   ```

**标签：** 压缩、squash、reset --soft、整理、提交、分支

---

#### 📋 配方 · 查找删除某文件的提交

**查找删除某文件的提交**

> 排查「xxx 文件怎么没了」——用 log --diff-filter=D 定位是哪个提交删除了某个文件。

**一键执行：**

```bash
# 查找删除指定文件的提交
git log --diff-filter=D --oneline -- path/to/deleted-file

# 查看删除时的完整 diff
git log --diff-filter=D -p -- path/to/deleted-file

# 用 rev-list 统计
# 找到删除该文件的所有提交 SHA 并查看详情
```

**步骤拆解：**

1. 查找删除该文件的所有提交

   ```bash
   git log --diff-filter=D --oneline -- path/to/deleted-file
   ```

2. 查看最后一次删除的详细信息

   ```bash
   git log --diff-filter=D -p -1 -- path/to/deleted-file
   ```

3. 如果需要恢复，从删除提交的前一个提交捞回来

   ```bash
   git checkout <commit>^ -- path/to/deleted-file
   ```

**标签：** 删除、文件、查找、diff-filter、排查、log

---

#### 📋 配方 · 查看分支间差异提交 — log .. 双点语法

**查看分支间差异提交 — log .. 双点语法**

> 快速查看「我的分支比 main 多了哪些提交」或反过来——双点语法是比较分支的利器。

**一键执行：**

```bash
# 查看 feature 有但 main 没有的提交
git log main..feature --oneline

# 查看 main 有但 feature 没有的提交
git log feature..main --oneline

# 三点语法：查看两边各自独有的提交
git log main...feature --oneline --left-right
```

**步骤拆解：**

1. 查看当前分支领先 main 多少提交

   ```bash
   git log main..HEAD --oneline
   ```

2. 查看 main 比当前分支多了什么

   ```bash
   git log HEAD..main --oneline
   ```

3. 三点语法：看哪些是 main 的、哪些是 feature 的

   ```bash
   git log main...feature --oneline --left-right
   ```

**标签：** 差异、log、范围、比较、分支、..

---

#### 📋 配方 · 从远程检出分支 — fetch + switch

**从远程检出分支 — fetch + switch**

> 同事推了一个新分支，你本地没有——先 fetch 拉取远程引用，再 switch -c 创建本地跟踪分支。

**一键执行：**

```bash
# 1. 拉取远程最新引用
git fetch origin

# 2. 基于远程分支创建本地分支
git switch -c feature/new-api origin/feature/new-api

# 3. 或者在一行搞定
git fetch origin feature/new-api && git switch -c feature/new-api origin/feature/new-api
```

**步骤拆解：**

1. 拉取远程分支列表

   ```bash
   git fetch origin
   ```

2. 查看远程有哪些分支可用

   ```bash
   git branch -r
   ```

3. 创建本地分支并跟踪远程分支

   ```bash
   git switch -c feature/new-api origin/feature/new-api
   ```

**标签：** 远程、检出、fetch、switch、分支、跟踪

---

#### 📋 配方 · 查看 stash 详细内容 — stash show

**查看 stash 详细内容 — stash show**

> 有多个 stash 但忘了每个里面存了什么——stash show -p 查看 stash 的完整 diff，stash list 看列表。

**一键执行：**

```bash
# 列出所有 stash
git stash list

# 查看最近 stash 的完整 diff
git stash show -p

# 查看指定 stash（如 stash@{2}）的 diff
git stash show -p stash@{2}
```

**步骤拆解：**

1. 先看所有 stash 列表

   ```bash
   git stash list
   ```

2. 查看某个 stash 的统计信息（文件名 + 修改行数）

   ```bash
   git stash show stash@{0}
   ```

3. 查看完整 diff（确认里面到底藏了什么）

   ```bash
   git stash show -p stash@{0}
   ```

**标签：** stash、查看、diff、暂存、检查

---

#### 📋 配方 · 自动化 bisect 排查 — git bisect run

**自动化 bisect 排查 — git bisect run**

> 如果测试脚本能判断 bug 是否存在，可以用 bisect run 全自动二分定位——Git 自动 checkout 不同版本并运行测试，直到找到引入 bug 的提交。

**一键执行：**

```bash
# 1. 开始 bisect
git bisect start

# 2. 标记好坏
git bisect bad HEAD
git bisect good v1.0.0

# 3. 自动运行测试脚本
git bisect run npm test

# 4. 找到后结束
git bisect reset
```

**步骤拆解：**

1. 开始二分查找

   ```bash
   git bisect start
   ```

2. 标记最新为坏、旧版本为好

   ```bash
   git bisect bad HEAD
   git bisect good v1.0.0
   ```

3. 让测试脚本自动判断（返回 0=good, 1-127=bad）

   ```bash
   git bisect run npm test
   ```

4. Git 自动二分查找，找到后输出第一次失败的提交

   ```bash
   # 完成后执行 git bisect reset 回到正常状态
   ```

**标签：** bisect、自动化、bug、定位、测试、二分

---

#### 📋 配方 · 拆分一个提交为多个小提交 — reset + add -p

**拆分一个提交为多个小提交 — reset + add -p**

> 已经提交了一大坨修改，想拆分回多个语义独立的提交——先用 soft reset 回到暂存，再用 add -p 分批提交。

**一键执行：**

```bash
# 假设最新一次提交包含了 3 个不相关的修改
git reset --soft HEAD~1

# 现在所有修改回到暂存区，分批提交
git reset HEAD .                  # 先把所有文件移出暂存区
git add -p src/api.js             # 精细挑选：只暂存 API 相关修改
git commit -m "refactor: API layer"
git add src/cache.js              # 第二批：缓存层
git commit -m "perf: add cache layer"
git add src/ui.js                 # 第三批：UI
git commit -m "feat: new dashboard UI"
```

**步骤拆解：**

1. soft reset 撤销提交，修改回到暂存区

   ```bash
   git reset --soft HEAD~1
   ```

2. 把所有文件从暂存区移出（回到工作区）

   ```bash
   git reset HEAD .
   ```

3. 逐文件或逐块暂存第一批修改

   ```bash
   git add -p src/api.js
   ```

4. 提交第一批

   ```bash
   git commit -m "refactor: API layer"
   ```

5. 同样方式提交第二批、第三批...

   ```bash
   git add src/cache.js
   git commit -m "perf: add cache layer"
   ```

**标签：** 拆分、reset、add -p、提交、分解、整理

---

#### 📋 配方 · 清除已提交的敏感数据 — git filter-repo

**清除已提交的敏感数据 — git filter-repo**

> 密码、密钥或大文件不小心提交了——用 git filter-repo（现代化替代 filter-branch）从整个历史中彻底删除。⚠️ 会重写历史，协作分支需全员重新克隆。

**一键执行：**

```bash
# 安装 filter-repo（首次使用）
pip install git-filter-repo

# 从所有历史中删除某个文件
git filter-repo --path secrets/credentials.json --invert-paths

# 从所有历史中删除匹配 pattern 的文件
git filter-repo --path-glob '*.pem' --invert-paths

# 替换历史中的敏感字符串
git filter-repo --replace-text <(echo 'old-password==>REDACTED')
```

**步骤拆解：**

1. 先备份仓库（或确保远程有最新副本）

   ```bash
   git clone --mirror <repo> backup.git  # 安全操作
   ```

2. 安装 git-filter-repo 工具

   ```bash
   pip install git-filter-repo
   ```

3. 从整个 Git 历史中彻底删除指定文件

   ```bash
   git filter-repo --path secrets/credentials.json --invert-paths
   ```

4. 强制推送到远程（⚠️通知协作者重新克隆）

   ```bash
   git push --force origin --all
   git push --force origin --tags
   ```

**标签：** 敏感数据、安全、filter-repo、重写历史、清理、密码

---

#### 📋 配方 · git rebase --onto 详解 — 精准移植提交

**git rebase --onto 详解 — 精准移植提交**

> --onto 是 rebase 最强大也最让人困惑的选项：将一段提交范围「嫁接」到新的基础上。典型场景——feature 分支基于 develop，但 develop 已合并进 main，现在想让 feature 直接基于 main。

**一键执行：**

```bash
# 语法：git rebase --onto <新基底> <旧基底> <分支>
# 含义：取出「旧基底..分支」之间的所有提交，嫁接到「新基底」上

# 场景：feature 基于 develop，main 已包含 develop 的更新
# 用 merge-base 找到分叉点
git checkout feature
git rebase --onto main $(git merge-base develop feature) feature

# 等价于：把 feature 的独有提交移植到 main 上
```

**步骤拆解：**

1. 理解 --onto 的三参数含义

   ```bash
   # git rebase --onto <新基底> <旧基底> <分支>
   # 取 <旧基底> 到 <分支> 之间的提交，嫁接到 <新基底> 上
   ```

2. 找到 feature 分支与 develop 的分叉点

   ```bash
   git merge-base develop feature
   ```

3. 将 feature 的独有提交嫁接到 main 上

   ```bash
   git checkout feature
   git rebase --onto main $(git merge-base develop feature)
   ```

4. 如果有冲突，解决后继续

   ```bash
   git rebase --continue
   ```

**标签：** rebase、--onto、嫁接、移植、分支、高级

---
