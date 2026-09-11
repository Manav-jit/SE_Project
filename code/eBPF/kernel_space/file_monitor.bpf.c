#include "vmlinux.h"
#include <bpf/bpf_helpers.h>
#include <bpf/bpf_tracing.h>

char LICENSE[] SEC("license") = "GPL";

#define UNKNOWN 0
#define TRUSTED 1

struct{
	__uint(type,BPF_MAP_TYPE_HASH);
	__uint(max_entries,1024);
	__type(key,__u64);
	__type(value,__u8);
}file_state SEC(".maps");

struct file_event{
	__u32 pid;
	__u32 uid;
	__u64 inode;
	char filename[128];
};

SEC("tracepoint/syscalls/sys_enter_openat") /* eBPF is fired whenever a process asks to kernel to open a file*/

int monitor_file(struct trace_event_raw_sys_enter *ctx){
	struct file_event event = {};

	__u64 pid_uid;
	__u64 *state;

	pid_uid - bpf_get_current_pid_tgid();

	event.pid = pid_uid>>32;
	event.uid = bpf_get_current_uid_gid();

	bpf_probe_read_user_str(
		event.filename,
		sizeof(event.filename),
		(const char *)ctx->args[1] /* file name is stored here*/		
	);
	
	state = NULL;

	if (state == NULL) {
		bpf_printk(
			"UNKNOWN FILE err: pid= %d uid=%d file=%s",
			event.pid,
			event.uid,
			event.filename		
		);
	}
	return 0;
}
