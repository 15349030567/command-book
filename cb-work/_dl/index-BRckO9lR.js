const n=[{name:"分布式锁 — SET NX EX",description:"使用 SET NX EX 实现简单分布式锁：获取锁 → 执行业务 → Lua 脚本原子释放。核心要点：必须设置过期时间防止死锁，释放时必须验证 token 防止误删。",fullCommand:`# 获取锁
SET lock:order-123 token-uuid NX EX 30

# 执行业务逻辑...

# 原子释放锁（仅当 token 匹配时删除）
EVAL "if redis.call('get',KEYS[1])==ARGV[1] then return redis.call('del',KEYS[1]) end return 0" 1 lock:order-123 token-uuid`,steps:[{description:"尝试获取锁（NX = 仅当 key 不存在，EX 30 = 30 秒自动过期防死锁）",code:"SET lock:order-123 token-uuid NX EX 30"},{description:"执行业务逻辑（如扣库存、创建订单等）",code:"... your business logic ..."},{description:"Lua 脚本原子释放：检查 token 是否匹配，匹配才删除",code:`EVAL "if redis.call('get',KEYS[1])==ARGV[1] then return redis.call('del',KEYS[1]) end return 0" 1 lock:order-123 token-uuid`}],tags:["锁","分布式","并发","原子","Lua","NX","互斥"],category:"string",type:"pattern",lang:"redis"},{name:"简单限流器 — INCR + EXPIRE",description:"基于 INCR 实现 API 调用频率限制：每次请求对计数器自增，首次设置过期时间。如果计数超过阈值（如 100 次/分钟）则拒绝请求。",fullCommand:`local current = redis.call('INCR', KEYS[1])
if current == 1 then
    redis.call('EXPIRE', KEYS[1], ARGV[1])
end
if current > tonumber(ARGV[2]) then
    return 0
end
return 1`,steps:[{description:"定义限流 Lua 脚本（原子操作）",code:`local current = redis.call('INCR', KEYS[1])
if current == 1 then
    redis.call('EXPIRE', KEYS[1], ARGV[1])
end
if current > tonumber(ARGV[2]) then
    return 0
end
return 1`},{description:"客户端调用：key=限流标识，ARGV[1]=窗口秒数，ARGV[2]=阈值",code:"EVAL <script> 1 rate:api:user123 60 100"}],tags:["限流","频率","计数","原子","Lua","API"],category:"string",type:"script",lang:"lua"},{name:"乐观锁 — WATCH + MULTI/EXEC",description:"使用 WATCH 实现乐观锁：监控 key → 读取值 → 在事务中更新，如果 key 在 WATCH 后被其他客户端修改，事务自动放弃。适用于转账、库存扣减等需要数据一致性的场景。",fullCommand:`WATCH account:A account:B
valA = GET account:A
valB = GET account:B
MULTI
DECRBY account:A 100
INCRBY account:B 100
EXEC`,steps:[{description:"监控要操作的 key（任何修改将导致事务放弃）",code:"WATCH account:A account:B"},{description:"读取当前余额",code:`GET account:A
GET account:B`},{description:"开启事务，执行转账",code:`MULTI
DECRBY account:A 100
INCRBY account:B 100
EXEC`},{description:"如果 EXEC 返回 nil，说明数据被修改，重试整个流程",code:"# 客户端应检查 EXEC 返回值，返回 nil 则重试"}],tags:["乐观锁","事务","WATCH","一致性","转账","CAS"],category:"key",type:"sequence",lang:"redis"},{name:"排行榜 Top N — ZADD + ZREVRANGE",description:"使用有序集合实现实时排行榜：ZADD 更新分数，ZREVRANGE 查询排名。支持按分数范围查询、按排名范围查询。",fullCommand:`# 更新玩家分数
ZADD leaderboard 1500 player:1
ZADD leaderboard 1200 player:2
ZADD leaderboard 1800 player:3

# 查询 Top 5（分数从高到低）
ZREVRANGE leaderboard 0 4 WITHSCORES`,steps:[{description:"更新或添加玩家分数（分数相同按成员名字典序排）",code:"ZADD leaderboard 1500 player:1"},{description:"查询前 5 名（ZREVRANGE 逆序 = 高分在前）",code:"ZREVRANGE leaderboard 0 4 WITHSCORES"},{description:"查询指定玩家排名（0-based）",code:"ZREVRANK leaderboard player:1"}],tags:["排行榜","有序集合","排序","游戏","排名","Top N"],category:"sorted-set",type:"pattern",lang:"redis"},{name:"消息队列 — LPUSH + BRPOP",description:"使用列表实现简单的生产者-消费者消息队列：生产者 LPUSH 消息到列表，消费者 BRPOP 阻塞等待。BRPOP 支持超时，避免空轮询消耗 CPU。",fullCommand:`# 生产者
LPUSH queue:emails 'to:alice@example.com, subject:Welcome'

# 消费者（阻塞等待 5 秒）
BRPOP queue:emails 5`,steps:[{description:"生产者将消息推入队列头部",code:"LPUSH queue:emails '{...message...}'"},{description:"消费者阻塞弹出（最多等待 5 秒，队列空则返回 nil）",code:"BRPOP queue:emails 5"},{description:"多消费者自动负载均衡：一条消息只被一个消费者获取",code:"# 启动多个消费者实例，Redis 自动分配消息"}],tags:["消息队列","列表","阻塞","生产者","消费者","异步"],category:"list",type:"pattern",lang:"redis"},{name:"数据备份 — BGSAVE + LASTSAVE",description:"后台异步持久化 RDB 快照。先检查上次备份状态，触发 BGSAVE，轮询 LASTSAVE 确认完成。",fullCommand:`# 检查上次备份时间
LASTSAVE

# 触发后台保存
BGSAVE

# 等待完成后再次检查
LASTSAVE`,steps:[{description:"查看上次成功保存的时间戳",code:"LASTSAVE"},{description:"触发后台 RDB 快照（fork 子进程，不阻塞主线程）",code:"BGSAVE"},{description:"确认备份完成（对比前后 LASTSAVE 时间）",code:"LASTSAVE"}],tags:["备份","持久化","RDB","快照","运维","安全"],category:"key",type:"admin",lang:"redis"},{name:"Cache-Aside — GET + SET EX",description:"经典缓存穿透模式：先查 Redis，命中直接返回；未命中则查 DB，结果写回 Redis 并设 TTL。降低 DB 压力，适用于读多写少的热点数据。",fullCommand:`# 伪代码流程
val = GET cache:user:123
if val:
    return val
val = DB.query('SELECT * FROM users WHERE id=123')
SETEX cache:user:123 3600 val
return val`,steps:[{description:"先查缓存",code:"GET cache:user:123"},{description:"缓存未命中 → 查数据库",code:"# val = DB.query('SELECT ...')"},{description:"写回缓存并设 1 小时过期",code:"SETEX cache:user:123 3600 '<serialized data>'"}],tags:["缓存","Cache-Aside","穿透","DB","TTL","读多写少"],category:"string",type:"pattern",lang:"redis"},{name:"缓存雪崩防护 — SET 随机 EX",description:"批量缓存预热时为每个 key 设置随机偏移的过期时间，避免大量 key 同一时刻同时过期导致 DB 压力骤增。",fullCommand:`# 基础 TTL 1 小时（3600s），随机偏移 ±600s
SET cache:hot:article:1 '<data>' EX 3600
SET cache:hot:article:2 '<data>' EX 3420
SET cache:hot:article:3 '<data>' EX 3780`,steps:[{description:"为每个缓存 key 设置略有差异的过期时间",code:"SET cache:hot:article:1 '<data>' EX 3600"},{description:"第二个 key 过期时间偏移 -2 分钟",code:"SET cache:hot:article:2 '<data>' EX 3420"},{description:"第三个 key 过期时间偏移 +2 分钟",code:"SET cache:hot:article:3 '<data>' EX 3780"},{description:"核心：生产代码中应使用 random.randint(-600, 600) 为每个 key 生成随机偏移",code:"# TTL = 3600 + random.randint(-600, 600)"}],tags:["缓存","雪崩","过期","随机","批量","DB保护"],category:"string",type:"pattern",lang:"redis"},{name:"分布式 ID 生成器 — INCR",description:"使用 Redis 原子递增生成全局唯一的递增 ID——比数据库自增更灵活，比雪花算法更简单，适合订单号/用户ID等场景。",fullCommand:`# 初始化（可选）
SET seq:order:id 0

# 每次获取新 ID
INCR seq:order:id
# 返回 1, 2, 3, ...`,steps:[{description:"初始化序列（如果不存在，INCR 自动从 0+1 开始，此步可省略）",code:"SET seq:order:id 0"},{description:"原子获取下一个 ID",code:"INCR seq:order:id"},{description:"组合业务前缀生成订单号",code:"# order_no = f'ORD-{datetime.now():%Y%m%d}-{id:08d}'"}],tags:["分布式ID","原子","递增","订单号","唯一","序列"],category:"string",type:"pattern",lang:"redis"},{name:"滑动窗口限流 — ZSET + Lua",description:"使用有序集合实现精确的滑动窗口限流：每次请求将当前时间戳加入 ZSET，同时删除窗口外的旧记录，再计数判断。比 INCR 固定窗口更精确，避免边界突发。",fullCommand:`local now = redis.call('TIME')[1]
local window = tonumber(ARGV[1])
local threshold = tonumber(ARGV[2])
redis.call('ZREMRANGEBYSCORE', KEYS[1], 0, now - window)
local count = redis.call('ZCARD', KEYS[1])
if count >= threshold then return 0 end
redis.call('ZADD', KEYS[1], now, now .. '-' .. count)
redis.call('EXPIRE', KEYS[1], window)
return 1`,steps:[{description:"Lua 脚本：删除窗口外的旧请求",code:"redis.call('ZREMRANGEBYSCORE', KEYS[1], 0, now - window)"},{description:"统计当前窗口内请求数",code:"local count = redis.call('ZCARD', KEYS[1])"},{description:"超过阈值则拒绝（返回 0）",code:"if count >= threshold then return 0 end"},{description:"记录本次请求时间戳",code:"redis.call('ZADD', KEYS[1], now, now .. '-' .. count)"},{description:"客户端调用（60s 窗口内最多 100 次）",code:"EVAL <script> 1 rate:api:user123 60 100"}],tags:["限流","滑动窗口","精确","有序集合","ZSET","防刷"],category:"sorted-set",type:"script",lang:"lua"},{name:"延迟队列 — ZADD + ZRANGEBYSCORE",description:"使用有序集合实现延迟队列：消息体为 member，执行时间为 score。消费者轮询 ZRANGEBYSCORE 获取到期任务，ZREM 确认消费。适用于订单超时取消、定时通知等。",fullCommand:`# 生产者：添加 30 秒后执行的任务
ZADD delay:queue 1735690000 '{"orderId":123,"action":"cancel"}'

# 消费者：拉取到期任务
ZRANGEBYSCORE delay:queue 0 1735690000 LIMIT 0 10

# 确认消费（移除）
ZREM delay:queue '{"orderId":123,"action":"cancel"}'`,steps:[{description:"添加延迟任务（score = 执行时间戳）",code:`ZADD delay:queue 1735690000 '{"orderId":123,"action":"cancel"}'`},{description:"消费者轮询：拉取当前时间之前的到期任务",code:"ZRANGEBYSCORE delay:queue 0 <now_timestamp> LIMIT 0 10"},{description:"确认消费后移除（需用原子 Lua 防止重复消费）",code:`ZREM delay:queue '{"orderId":123,"action":"cancel"}'`}],tags:["延迟队列","定时","任务","有序集合","超时","取消"],category:"sorted-set",type:"pattern",lang:"redis"},{name:"共同好友 — SINTER",description:"使用集合交集运算实现「共同好友/共同关注」功能：两个用户的关注列表做交集，秒级返回结果。",fullCommand:`# 用户 1 的好友
SADD friends:alice bob charlie dave eve

# 用户 2 的好友
SADD friends:bob alice charlie frank

# 共同好友
SINTER friends:alice friends:bob
# 返回：charlie`,steps:[{description:"存储用户 A 的好友集合",code:"SADD friends:alice bob charlie dave eve"},{description:"存储用户 B 的好友集合",code:"SADD friends:bob alice charlie frank"},{description:"求交集 = 共同好友",code:"SINTER friends:alice friends:bob"},{description:"推荐「可能认识的人」= B 的好友 - A 的好友（差集）",code:"SDIFF friends:bob friends:alice"}],tags:["共同好友","交集","社交","推荐","集合","SINTER"],category:"set",type:"pattern",lang:"redis"},{name:"浏览历史 — LPUSH + LTRIM",description:"使用列表保存用户最近浏览记录：每次浏览 LPUSH 到头部，LTRIM 保留最近 100 条。兼顾写入性能与存储上限。",fullCommand:`# 用户浏览了一篇文章
LPUSH history:user:123 'article:456'

# 只保留最近 100 条
LTRIM history:user:123 0 99

# 查看最近 20 条浏览
LRANGE history:user:123 0 19`,steps:[{description:"推送浏览记录到列表头部（最新的在前）",code:"LPUSH history:user:123 'article:456'"},{description:"裁剪保留最近 100 条（防止列表无限增长）",code:"LTRIM history:user:123 0 99"},{description:"查询最近 20 条浏览记录",code:"LRANGE history:user:123 0 19"}],tags:["浏览历史","列表","裁剪","去重","最近","用户行为"],category:"list",type:"pattern",lang:"redis"},{name:"实时计数器看板 — HINCRBY + HGETALL",description:"使用哈希表做实时统计看板：HINCRBY 原子更新各类指标，HGETALL 一次拉取全量数据。适用于页面 PV/UV、API 调用量、业务指标等实时大盘。",fullCommand:`# 更新指标
HINCRBY stats:dashboard:today page_views 1
HINCRBY stats:dashboard:today api_calls 1
HINCRBY stats:dashboard:today errors 1
HINCRBY stats:dashboard:today revenue 999

# 拉取全量看板数据
HGETALL stats:dashboard:today`,steps:[{description:"原子递增各维度指标",code:"HINCRBY stats:dashboard:today page_views 1"},{description:"批量更新多个指标（Pipeline 或事务）",code:`HINCRBY stats:dashboard:today api_calls 1
HINCRBY stats:dashboard:today errors 1`},{description:"一次拉取全部指标数据",code:"HGETALL stats:dashboard:today"},{description:"每日重置（定时任务新建 key 或 FLUSHDB 特定库）",code:"# 可用 stats:dashboard:2026-07-31 作为每日独立 key"}],tags:["计数器","实时","看板","统计","指标","PV","哈希"],category:"hash",type:"pattern",lang:"redis"},{name:"大 Key 扫描 — SCAN + MEMORY USAGE",description:"使用 SCAN 安全遍历 + MEMORY USAGE 估算内存，排查占用过大的 key。比 KEYS 安全（非阻塞），配合 TYPE 可过滤特定数据类型。",fullCommand:`# 逐步扫描，每次 100 个 key
SCAN 0 COUNT 100

# 对可疑大 key 估算内存
MEMORY USAGE user:1:big-hash

# 组合使用：扫描并过滤
SCAN 0 MATCH cache:* COUNT 100`,steps:[{description:"从游标 0 开始扫描（非阻塞，生产安全）",code:"SCAN 0 COUNT 100"},{description:"对返回的每个 key 估算内存占用",code:"MEMORY USAGE user:1:big-hash"},{description:"按模式匹配缩小范围",code:"SCAN 0 MATCH cache:* COUNT 100"},{description:"对于大 key 使用 UNLINK 异步删除（不阻塞）",code:"UNLINK big:cache:key"}],tags:["大Key","扫描","内存","诊断","优化","非阻塞"],category:"key",type:"admin",lang:"redis"},{name:"Stream 可靠消息队列 — XADD + XREADGROUP + XACK",description:"使用 Redis Stream + 消费者组实现可靠消息队列：消息持久化 → 消费者组分发 → ACK 确认 → PEL 重投。比 List 队列多了消息确认、重试、多消费者负载均衡能力。",fullCommand:`# 1. 创建消费者组
XGROUP CREATE mystream mygroup $ MKSTREAM

# 2. 生产者发布消息
XADD mystream * type order_created order_id 123 amount 99.99

# 3. 消费者读取并处理
XREADGROUP GROUP mygroup consumer1 COUNT 1 BLOCK 5000 STREAMS mystream >

# 4. 确认处理完成
XACK mystream mygroup <message-id>

# 5. 监控积压
XPENDING mystream mygroup`,steps:[{description:"创建消费者组（$ = 只消费新消息，MKSTREAM = 不存在则自动创建）",code:"XGROUP CREATE mystream mygroup $ MKSTREAM"},{description:"生产者追加消息（* = 自动生成 ID）",code:"XADD mystream * type order_created order_id 123 amount 99.99"},{description:"消费者组读取（> = 只获取未分发的消息）",code:"XREADGROUP GROUP mygroup consumer1 COUNT 1 BLOCK 5000 STREAMS mystream >"},{description:"处理完成后确认（从 PEL 中移除）",code:"XACK mystream mygroup 1699999999999-0"},{description:"监控未确认消息积压",code:"XPENDING mystream mygroup"}],tags:["Stream","消费者组","可靠队列","ACK","消息","重试","分发"],category:"stream",type:"sequence",lang:"redis"},{name:"慢查询诊断 — SLOWLOG + CONFIG SET",description:"排查 Redis 性能瓶颈的标准流程：查看慢查询日志定位耗时命令，必要时调整阈值，优化后重置统计。",fullCommand:`# 1. 查看 Top 10 慢查询
SLOWLOG GET 10

# 2. 把阈值临时调低以抓取更多细节
CONFIG SET slowlog-log-slower-than 1000

# 3. 查看慢查询数量
SLOWLOG LEN

# 4. 分析完毕后清空旧记录
SLOWLOG RESET`,steps:[{description:"查看最近 10 条慢查询（含耗时和命令参数）",code:"SLOWLOG GET 10"},{description:"将慢查询阈值调为 1 毫秒（抓取更细粒度的慢操作）",code:"CONFIG SET slowlog-log-slower-than 1000"},{description:"查看当前积压多少条慢查询",code:"SLOWLOG LEN"},{description:"分析完毕，清空旧记录方便下次排查",code:"SLOWLOG RESET"}],tags:["慢查询","性能","诊断","排查","调优","运维"],category:"server",type:"admin",lang:"redis"},{name:"数据热迁移 — COPY + EXPIRE",description:"不中断服务的情况下迁移 key：COPY 克隆 key 到新名称，再设 TTL 让旧 key 逐渐过期，或直接 UNLINK 异步删除旧 key。适合重构 key 命名规范、数据迁移等场景。",fullCommand:`# 1. 克隆到新 key 名
COPY user:1:profile user:profile:1 REPLACE

# 2. 确认新 key 数据无误后，异步删除旧 key
UNLINK user:1:profile

# 3. 或者让旧 key 自然过期
EXPIRE user:1:profile 3600`,steps:[{description:"复制数据到新 key（REPLACE = 目标已存在则覆盖）",code:"COPY user:1:profile user:profile:1 REPLACE"},{description:"验证新 key 数据正确",code:"GET user:profile:1"},{description:"异步删除旧 key（生产安全，不阻塞）",code:"UNLINK user:1:profile"},{description:"或者设置短暂过期作为安全回滚窗口",code:"EXPIRE user:1:profile 3600"}],tags:["迁移","COPY","重命名","重构","数据","安全"],category:"key",type:"admin",lang:"redis"}],r=n.map(e=>({...e,_type:"recipe"}));export{r as ALL_RECIPES};
