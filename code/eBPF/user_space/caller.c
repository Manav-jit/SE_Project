#include <stdio.h>
#include <unistd.h>
#include <signal.h>

#include <bpf/libbpf.h>
#include "file_monitor.skel.h"

int stop = 0;

void sig_handler(int sig)
{
    stop = 1;
}

int main()
{
    struct file_monitor_bpf *skel;
    int err;

    signal(SIGINT, sig_handler);

    printf("Starting eBPF monitor...\n");

    skel = file_monitor_bpf__open();
    if (!skel) {
        printf("Error opening BPF program\n");
        return 1;
    }

    err = file_monitor_bpf__load(skel);
    if (err) {
        printf("Error loading BPF program\n");
        goto cleanup;
    }

    err = file_monitor_bpf__attach(skel);
    if (err) {
        printf("Error attaching BPF program\n");
        goto cleanup;
    }

    printf("BPF program attached\n");
    printf("Watching files...\n");

    while (!stop)
        sleep(1);

cleanup:
    file_monitor_bpf__destroy(skel);

    printf("Stopped\n");

    return 0;
}
