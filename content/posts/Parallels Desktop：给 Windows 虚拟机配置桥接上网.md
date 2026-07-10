---
title: "Parallels Desktop：给 Windows 虚拟机配置桥接上网"
date: 2026-07-10
description: "把 Parallels 里的 Windows VM 从 NAT 切到桥接，让它像局域网里一台独立的物理主机一样拿 IP——含完整配置步骤和 5 个常见坑的排查。"
tags: [Parallels, 虚拟机, macOS, 教程, 工具]
---

> Parallels 默认给 Windows VM 用 **Shared Network（NAT 模式）**：能上网，但从局域网看 VM 隐身。**桥接（Bridged）** 模式把虚拟网卡直接绑到你 Mac 的物理网卡上，让 VM 像局域网里的一台独立物理主机一样出现。改三个设置，30 秒搞定。

## 什么时候需要桥接（什么时候不用）

**用桥接的场景**：

- 局域网里另一台设备要主动连 VM（比如同事的 Windows 通过 IP 远程桌面连进你 Mac 上的 VM）
- VM 跑的服务需要被局域网发现（SMB 文件共享、Jenkins、HTTP 服务、打印机共享）
- VM 需要在 P2P / 多播协议下被发现（mDNS、Bonjour）
- 你想用 Mac 自己的防火墙规则管 VM 的网络（VM 直接暴露在路由器下）
- 跑渗透测试 / 网络实验时，VM 看起来像一台独立机器

**用默认的 NAT 模式就够了**：

- VM 只是用来跑 IDE、Office、Photoshop，不需要局域网其他设备找它
- 想用最少配置、不想管 IP 段
- Mac 的 Wi-Fi 经常切换（NAT 比桥接稳，桥接换 Wi-Fi 会断网）

## 配置步骤

> 重要：改网络配置前**先关掉 VM**。Parallels 不让在运行时改 Source。

### 1. 关闭虚拟机

控制中心（Control Center）里找到你的 Windows VM，**右键 → 关机**（不是暂停）。

### 2. 打开 Configure

VM 窗口在菜单栏显示时，**操作 → Configure**，或点窗口右上角的齿轮图标。

### 3. 切到 Hardware → Network，改 Source

- 顶部 tab 选 **硬件**（Hardware）
- 左侧列表选 **网络**（Network）
- **源（Source）下拉改成「默认适配器」**——这就是桥接模式

![Parallels Configure 界面：Hardware tab → Network → Source = 默认适配器（Default Adapter）](https://img.aqifei.top/img/2026/07/1783650805290-parallels-configure-network.png)

*Parallels Configure → 硬件 → 网络 → 源 = 「默认适配器」。这一步就把虚拟网卡绑到了 Mac 当前正在用的物理网卡（Wi-Fi 或有线）。*

**Source 下拉三个选项的区别**：

| 选项 | 行为 |
|---|---|
| **共享网络**（默认）| NAT 模式，VM 隐身，只能出去不能被找 |
| **桥接网络 → 默认适配器** | 绑到 Mac 当前激活的网卡，VM 拿独立 IP ✅ |
| **桥接网络 → 选定适配器** | 手动指定某个网卡（多网卡场景才用，比如 Mac 同时有 Wi-Fi + 有线 + USB-C 网卡）|

普通一台 Mac 接一个 Wi-Fi 的情况下，**「默认适配器」就够了**。多网卡或特殊路由需求才选「选定适配器」。

### 4. 启动 VM，它会自动拿 IP

启动 VM，进 Windows。打开 PowerShell 或 cmd，跑：

```powershell
ipconfig
```

你应该看到类似：

```
以太网适配器 以太网:
   IPv4 地址 . . . . . . . . . . . . : 192.168.1.137
   子网掩码  . . . . . . . . . . . . : 255.255.255.0
   默认网关. . . . . . . . . . . . . . : 192.168.1.1
```

**关键检查**：

- IP 跟你 Mac 的 IP 在**同一个网段**（`192.168.1.x` 同 `192.168.1.x`）
- 默认网关跟 Mac 的网关一样（一般是路由器 IP）

如果 IP 显示成 `169.254.x.x`（APIPA 地址），说明 VM 没拿到 DHCP。回 §5 排查。

### 5. 从 Mac / 局域网验证

Mac 终端跑：

```bash
ping -c 3 192.168.1.137   # 用你 VM 拿到的 IP
arp -a | grep 192.168.1.137   # 确认 ARP 表里有它
```

或者在 Mac Finder → 网络（Network）里，看 Windows VM 是不是出现在 Bonjour 列表里（mDNS 默认开，VM 名字形如 `WINDOWS-XXXXXX`）。

## 5 个最常见的坑

### ① VM 拿到 169.254.x.x（APIPA 地址）

**原因**：VM 内部 IPv4 还是 NAT 模式没切换过来，或者 DHCP 请求被路由器挡了。

**修**：
- Windows 端：`ncpa.cpl` 打开网络连接 → Ethernet 属性 → IPv4 → 确认是**自动获得 IP 地址（DHCP）**
- 关 VM → Configure → Network → Source 再切一次（默认适配器 → 选定适配器 → 默认适配器），相当于 toggle 一下
- 路由器管理界面看 DHCP 客户端列表有没有 VM 的 MAC

### ② 同一网段但 Mac ping 不通 VM

**原因**：Mac 防火墙（macOS Application Firewall 或 Little Snitch 等）拦截了入站。

**修**：
- 系统设置 → 网络 → 防火墙 → 允许 VM 的连接
- 或者临时关防火墙验证：`sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate off`（生产环境别关）

### ③ 改完 Source 启动后 Parallels 报 "Failed to configure network"

**原因**：Mac 的物理网卡此时被 VPN / 公司网络管理 agent / 安全软件锁住了。

**修**：
- 断 VPN 重试
- 检查 `/var/log/parallels.log` 找具体错（`log show --predicate 'process == "prl_naptd"' --last 5m`）
- 重启 Mac 的网络栈试试：`sudo ifconfig en0 down && sudo ifconfig en0 up`（或者重启 Mac 更快）

### ④ Parallels Tools 没装 → 网络适配器识别不到

**症状**：Windows 设备管理器里看不到 Parallels 的网络适配器。

**修**：VM 启动后，Parallels 菜单 → **操作 → 安装 Parallels Tools**（或在 VM 第一次启动时的顶部提示条里点 Install）。Tools 装完重启 VM。

### ⑤ Wi-Fi 切换后 VM 断网

**原因**：桥接模式下 VM 直接连物理网卡，Wi-Fi 切换会断开。

**修**：
- 让 Mac 固定在一个网络（办公室 Wi-Fi，别来回切）
- 或者回 NAT 模式（牺牲可发现性换稳定性）

## 切回 NAT 模式

万一你后悔了：

1. 关 VM
2. Configure → Hardware → Network
3. Source 改回「共享网络」

10 秒切回。VM 内部 IP 也会自动变回 `10.211.55.x` 那一段（Parallels NAT 子网）。

## 提醒

- **DHCP 池**：你的路由器要给 VM 分配独立 IP。如果 DHCP 池快满了（一般 254 个地址），VM 拿不到 IP 也会卡 169.254
- **端口冲突**：VM 在桥接模式下和 Mac 是平等的局域网设备，**它们各自的服务端口要分别考虑**（比如 Mac 跑 8080，VM 也能跑 8080，没冲突因为 IP 不同）
- **静态 IP**：如果想给 VM 固定 IP，**在路由器上做 DHCP 静态分配**（按 MAC 绑定），比在 Windows 里手动设更稳
- **mDNS 跨网段**：VM 拿到独立 IP 后，Mac 上 Finder 的"网络"里就能直接看到它了——这是最直观的"桥接成功"信号

---

*配图来自你 Mac 上的 Parallels Desktop 真实配置（Hardware → Network → Source = 默认适配器）。*