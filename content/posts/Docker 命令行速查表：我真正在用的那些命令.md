---
title: "Docker 命令行速查表：我真正在用的那些命令"
date: 2026-07-09
description: "Docker CLI 我每周都会敲的命令——生命周期、run、查看、exec、镜像、卷、网络、清理、Compose——压在一页里，你可以钉在显示器旁边。"
tags: [Docker, 工具, 效率工具, 教程]
---

> 你跑过一次 `docker run hello-world`。结果现在有 47 个容器、3 个死掉的镜像、一个说不清哪来的 30GB 构建缓存。下面这些命令就是用来从那堆烂摊子里脱身的——我每周都在用，钉在显示器旁边。

Docker 的 CLI 命令有一大堆，但 95% 的活儿 30 个命令就够用了。这是我个人的速查表——每周都会敲的那些，加上我真正在用的 flag 和踩过的坑。看一遍，然后开着这个标签页。

## 1. 生命周期：「生、跑、死」那一组动词

每个容器都经历一小段状态切换。记住这六个：

```bash
docker create   [IMAGE] [CMD]    # 创建容器但不启动
docker start    [CONTAINER]     # 启动已创建/已停止的容器
docker run      [IMAGE] [CMD]   # 创建 + 启动一气呵成（最常用）
docker stop     [CONTAINER]     # SIGTERM, 10 秒后 SIGKILL
docker restart  [CONTAINER]     # 停止 + 启动
docker rm       [CONTAINER]     # 删除已停止的容器
docker kill     [CONTAINER]     # 立刻 SIGKILL（不等）
```

`docker rm` 上你会想用的三个 flag：

```bash
docker rm -f  CONTAINER          # 强删运行中的容器
docker rm -v  CONTAINER          # 同时删它关联的匿名 volume
docker rm -fv CONTAINER          # 两个都做
```

`docker run` 上两个相关 flag：

```bash
docker run --rm IMAGE            # 容器退出后自动删（一次性任务神器）
docker run --restart=always IMAGE # 主机重启/daemon 重启时拉起
```

## 2. `docker run`：主力命令，常用 flag

```bash
docker run -d -p 8080:80 \
    -e DATABASE_URL=postgres://... \
    -v $(pwd)/data:/var/lib/data \
    --name web \
    --restart=unless-stopped \
    nginx:1.27
```

参数逐条：

| Flag | 含义 |
|---|---|
| `-d` | 后台运行（Detached）|
| `-p 8080:80` | 主机端口 8080 → 容器端口 80 |
| `-e KEY=VALUE` | 设置环境变量 |
| `-v /主机路径:/容器路径` | 绑定挂载主机目录 |
| `--name web` | 给容器起个人类能读的名字（否则是随机形容词）|
| `--restart=unless-stopped` | 主机重启时拉起，除非你手动 stop 过 |
| `--network mynet` | 接到指定 Docker 网络（见第 6 节）|
| `-it` | 交互式 + TTY（用于 shell）|
| `--rm` | 容器退出后自动删 |

你敲得最多的 `docker run`，可能是这个进 shell 的版本：

```bash
docker run -it --rm alpine:latest sh      # 用完即弃的 alpine shell
docker run -it --rm ubuntu:24.04 bash    # 用完即弃的 ubuntu shell
```

## 3. 查看与日志：「为什么挂了」三件套

出问题的时候，按顺序用这些：

```bash
docker ps                  # 列运行中的容器
docker ps -a               # 包含已停止的
docker ps -a --format "table {{.ID}}\t{{.Image}}\t{{.Status}}\t{{.Names}}"
docker logs CONTAINER      # 看最后几行
docker logs -f CONTAINER   # 持续跟踪（像 tail -f）
docker logs --tail 200 CONTAINER  # 只看最后 200 行
docker logs --since 10m CONTAINER  # 最近 10 分钟
docker inspect CONTAINER   # 完整 JSON 元数据
docker stats               # 实时 CPU/内存/网络（像 htop）
docker top CONTAINER       # 容器内的进程（像 ps）
```

`--format` 是好朋友——它把 `docker ps` 从宽表变成你真正想看的列。

## 4. `docker exec`、`docker cp`：进出容器

```bash
docker exec -it CONTAINER sh          # 进运行中的容器拿 shell
docker exec -it CONTAINER bash        # 如果容器有 bash
docker exec CONTAINER cat /etc/hosts  # 跑一条命令就退出
docker exec -u root CONTAINER ...     # 用 root 跑（多数镜像降权了）

docker cp CONTAINER:/var/log/app.log ./app.log   # 从容器拷出来
docker cp ./config.json CONTAINER:/app/config.json # 拷进容器
```

`docker exec -it <id> sh` 是「让我看看里面有啥」的命令，**实际用得比你以为的多 10 倍**。

## 5. 镜像：拉、取、构、打标签、清

```bash
docker pull IMAGE[:TAG]      # 从 registry 下载
docker push IMAGE[:TAG]      # 上传（先 docker login）

docker images               # 列本地镜像
docker images -a            # 包含中间层
docker images -f dangling=true  # 只看 <none>:<none> 那些垃圾

docker tag SOURCE TARGET    # 比如 docker tag myapp:latest ghcr.io/me/myapp:v1
docker rmi IMAGE            # 删本地镜像
docker rmi $(docker images -q)   # 一锅端掉所有本地镜像（小心）

docker build -t myapp:latest .            # 从当前目录的 Dockerfile 构建
docker build -t myapp:v1.0 --build-arg VERSION=1.0 .

docker image prune          # 删 dangling 镜像
docker image prune -a       # 删所有未被使用的镜像
docker image inspect IMAGE  # JSON: 环境变量、入口、层信息
docker history IMAGE        # 逐层大小
```

注意：`docker rmi` 拒绝删除任何容器（哪怕已停止）还在用的镜像。`docker image prune -a` 是更省心的广覆盖选项。

## 6. 卷与网络：人人都会忘的那一块

卷是 Docker 管理的目录，用来持久化数据。**它跨容器删除而存活**——这要么是特性，要么是坑，看你知不知道它存在。

![Docker 卷架构图（来自官方文档）：三个节点各跑一个 service-replica，都连到下方的共享文件存储层](https://img.aqifei.top/img/2026/07/1783580682042-fig3-volumes-shared-storage.webp)

*图：[Docker Docs — Volumes](https://docs.docker.com/engine/storage/volumes/)（官方文档）。Docker 管理的卷与任何单一容器解耦，因此可以在多个副本之间共享，并在重启后保留。*

```bash
docker volume ls                    # 列所有卷
docker volume create mydata         # 创建一个命名卷
docker volume inspect mydata        # 看 Docker 在主机上把它存哪了
docker volume rm mydata             # 删一个卷
docker volume prune                 # 删所有未被使用的卷

# 在容器里挂载卷：
docker run -v mydata:/var/lib/data IMAGE
```

网络（对应的是连接性那一面）：

```bash
docker network ls                          # 列所有网络
docker network create mynet                # 创建一个用户自定义 bridge
docker network create --driver overlay mynet  # 用于 swarm/k8s 跨主机
docker network rm mynet
docker network prune                        # 删所有未用的

# 把运行中的容器接到一个网络（默认是 bridge）：
docker network connect mynet CONTAINER
docker network disconnect mynet CONTAINER

# 在 docker run 时接到指定网络：
docker run --network mynet --name web IMAGE
```

杀手锏：任何**同一个**用户自定义网络上的容器，可以**用名字**直接互访——不用 `--link`、不用查 IP，基本场景下连 docker-compose 都不用。

## 7. 清理：「我的硬盘去哪了」

这是速查表里最值钱的章节。**整个 Docker 文档里最有用的表**：

| 想清掉的 | 命令 | 说明 |
|---|---|---|
| 某个已停止的容器 | `docker rm <id>` | 用 ID 或名字；运行中加 `-f`；想一起删匿名 volume 加 `-v` |
| 某个镜像 | `docker rmi <image>` | 本地镜像，有容器（哪怕已停止）引用它就删不掉 |
| 所有已停止的容器 | `docker container prune` | 问 Y/N 然后删 |
| 所有 dangling 镜像 | `docker image prune` | dangling = `<none>:<none>`，构建残留 |
| 所有未用镜像（含带 tag 的）| `docker image prune -a` | 任何没被容器引用的都删 |
| 所有未用卷 | `docker volume prune` | 没有容器在挂的卷 |
| 所有未用网络 | `docker network prune` | 用户自建、没容器连的 |
| 构建缓存 | `docker builder prune` | 缓存的构建层——常常是最大的空间占用 |
| **一锅端** | **`docker system prune -a --volumes`** | **本表最危险——看清 Y 之前的提示再回车** |

我每周跑的两条：

```bash
docker system df       # 按容器/镜像/卷/构建缓存分桶显示磁盘占用
docker system df -v    # 带逐项明细
```

如果 `/var/lib/docker` 莫名其妙变胖，`docker system df` 会告诉你是哪一桶在吃空间。

## 8. Docker Compose：超过一个容器的时候

Compose 是一个 YAML 文件，描述多容器应用。一旦有了它，工作流就是：

```bash
docker compose up -d       # 启动 docker-compose.yml 里的全部
docker compose down        # 停掉并清理
docker compose ps          # 整个 stack 的状态
docker compose logs -f     # tail 所有日志（加服务名可限定范围）
docker compose logs -f web # 只 tail "web" 服务的日志
docker compose exec web sh # 进运行中的服务拿 shell
docker compose pull        # 拉取更新的基础镜像
docker compose build       # 重新构建文件里定义的镜像
docker compose restart web # 重启某个服务
```

什么时候该用 Compose：你有 >1 个需要一起启动的容器、想要可复现的本地开发环境、或者想把"跑了啥"作为文件 commit 到仓库里描述。单个服务的话，`docker run` 还是够用的。

## 速查表：我每天敲得最多的 8 个

把其他都剥掉，这就是我日常用的：

| 我想…… | 我敲 |
|---|---|
| 后台跑个东西 | `docker run -d --name x IMAGE` |
| 看啥在跑 | `docker ps` |
| 查为啥挂了 | `docker logs -f x` |
| 进容器看 | `docker exec -it x sh` |
| 拷文件出来调试 | `docker cp x:/path ./local` |
| 腾磁盘空间 | `docker system prune -a --volumes` |
| 起多容器应用 | `docker compose up -d` |
| 全停 | `docker compose down` |

打印出来钉在显示器旁边；等你的工作流变了再替换这 8 条。上面完整速查表是其他所有「这个怎么搞？」的备查。

---

*配图来源：Docker 官方文档 [Volumes](https://docs.docker.com/engine/storage/volumes/) 页（CC-BY 风格的官方文档图）。*