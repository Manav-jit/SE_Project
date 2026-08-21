# Project Proposal: AI-Assisted Zero-Trust Security Kernel

## 1. Introduction

Modern operating systems use different security mechanisms to protect files and processes. However, checking files repeatedly can add extra work for the system. At the same time, reducing these checks can make it easier for unsafe files or processes to cause damage.

This project proposes a kernel that works together with an AI-based security service. The kernel handles the actual security controls, while the AI looks at a file and its context and gives a security decision.

The main goal is to improve file security without making every file operation wait for a detailed security check.

---

## 2. Problem Statement

A file may be checked many times even when nothing about it has changed. Repeating the same checks can increase system overhead.

Simple rules can also miss important context. For example, a file may not look suspicious on its own, but its behaviour may become concerning if it was downloaded from an unknown source, created by an unusual process, or asks for access to resources it normally should not need.

The main question this project tries to answer is:

> **Can AI be used to make file security decisions while keeping the normal kernel operations fast and allowing the kernel to enforce those decisions?**

---

## 3. Proposed Approach

The system treats a new file as unknown until it has been checked. Each file is given a persistent identity and a small amount of information is stored about it.

```text
File ID
Version
Origin
Creator Process
Security State
AI Decision
```

When a process accesses a file, the kernel first checks its current security state.

### Fast Path

If the file has already been checked, is trusted, and has not changed, the kernel can use the existing decision and allow the operation to continue.

This avoids sending the same file for analysis every time it is accessed.

### AI Path

If the file is new, has changed, or does not have a valid decision, the kernel sends relevant information to the AI security service.

The AI can look at:

- Where the file came from
- Which process created it
- What operation is being requested
- What permissions or resources are being requested
- Previous decisions about the file
- Relevant file and process behaviour

The AI returns a security decision to the kernel. The kernel then decides what action to take based on that result and its own security rules.

---

## 4. System Flow

```text
                     File Activity
                           |
                           v
                        Kernel
                           |
              +------------+------------+
              |                         |
         Known State               Unknown State
              |                         |
              v                         v
          Fast Path                AI Analysis
              |                         |
              |                         v
              |                  Security Decision
              |                         |
              +------------+------------+
                           |
                           v
                     Kernel Policy
                           |
                 Allow / Restrict /
                  Deny / Quarantine
```

The AI analysis is handled outside the normal kernel execution path. This means that routine operations on files that already have a valid decision do not need to wait for another AI analysis.

---

## 5. File Identity and Security State

A PID cannot be used as a file identifier because a PID belongs to a process, not a file, and can be reused when processes exit.

Instead, the system maintains a separate identity for each file.

For example:

```text
File ID:       918273
Version:       42
Origin:        Browser Download
State:         Trusted
AI Decision:   Safe
```

The version is important because a file that was safe before may not remain safe after being changed.

For example:

```text
Trusted
   |
   | File Modified
   v
Unknown
   |
   v
AI Analysis
   |
   +------> Trusted
   |
   +------> Restricted
   |
   +------> Quarantined
```

This means that a trusted file does not have to be checked again unless something relevant changes.

---

## 6. Kernel and AI Responsibilities

| Kernel | AI Security Service |
| :--- | :--- |
| Maintains file identities | Looks at file and process context |
| Tracks file versions and security states | Looks for suspicious behaviour |
| Checks access requests | Gives a risk assessment |
| Allows or blocks operations | Provides a security decision |
| Applies restrictions | Sends updated decisions to the kernel |
| Handles quarantine | Does not directly control the kernel |

The AI does not directly modify the kernel or control system resources. Its result is sent back to the kernel, which remains responsible for enforcing the final decision.

---

## 7. Example Scenario

Consider a browser downloading an executable file.

```text
Origin:           Browser
File Type:        Executable
Creator:          Browser Process
Requested Action: Execute
Requested Access: Network + File Write
```

### Step 1: New File

The kernel creates a new file identity and marks the file as `Unknown`.

### Step 2: Analysis

The relevant file and process information is sent to the AI security service.

### Step 3: Decision

If the file is considered safe:

```text
AI
 |
 v
Trusted
 |
 v
Kernel updates state
 |
 v
Normal access
```

If the file is considered suspicious:

```text
AI
 |
 v
Restricted
 |
 v
Kernel applies restrictions
```

Depending on the situation, the kernel could prevent execution, restrict access, or quarantine the file.

### Step 4: File Changes

If the file is modified later, its previous trusted state is cleared and it can be checked again.

---

## 8. Project Objectives

1. Build a kernel-level mechanism for maintaining file identities and security states.
2. Connect the kernel with an external AI security service.
3. Keep the normal path for trusted files lightweight.
4. Avoid repeatedly analysing files that have not changed.
5. Detect file changes and require re-evaluation when needed.
6. Allow the kernel to enforce decisions such as allow, restrict, deny, and quarantine.
7. Measure the performance overhead caused by the security system.
8. Test the system using both normal and malicious workloads.

---

## 9. Expected Outcome

The expected result is a working prototype showing how a kernel and an AI security service can work together.

The prototype should demonstrate:

- Persistent file identity
- File security states
- Fast handling of trusted files
- Analysis of new or changed files
- Communication between the kernel and AI service
- Kernel-level enforcement of security decisions
- Performance measurements for the added security checks

---

## 10. Scope

The project will be developed and tested in a controlled Linux/QEMU environment.

The main areas of the project are:

- File identity
- File security states
- Kernel-level access control
- Communication between the kernel and AI service
- File and process monitoring
- Performance testing
- Basic restriction and quarantine

The project is a research prototype for studying the proposed approach. It is not intended to replace a production operating system or commercial security software.

