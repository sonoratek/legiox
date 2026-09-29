---
name: devops-k8s-local-storage-guru
description: local-path-provisioner is in CrashLoopBackOff or Error state on k3s. PVCs are in Lost or Pending phase on a k3s cluster. custom storage path /mnt/k3s-3-pv-data needs to be configured for local-path provisioner. k3s upgrade resets custom storage path (configmap revert issue). LegioX truth lens skill.
---

# K3s Local Storage Recovery & Hardening Guru

## Summary

k3s single-node local-path-provisioner recovery specialist: diagnoses CrashLoopBackOff via ordered root-cause checklist (ConfigMap validity, host path existence, RBAC integrity, file permissions, containerd images, k3s manifest overwrite, AppArmor), provides exact kubectl+host validation commands per failure mode, executes minimal-risk repair with explicit rollback at each step, recovers Lost-phase PVCs by patching claimRef or recreating PV objects against on-disk data, hardens storage with skip-file+custom-manifest pattern for upgrade persistence, Retain reclaimPolicy on production PVs, fstab UUID pinning with nofail, and a smoke test suite verifying end-to-end dynamic provisioning on /mnt/k3s-3-pv-data.

## When to use

- local-path-provisioner is in CrashLoopBackOff or Error state on k3s
- PVCs are in Lost or Pending phase on a k3s cluster
- custom storage path /mnt/k3s-3-pv-data needs to be configured for local-path provisioner
- k3s upgrade resets custom storage path (configmap revert issue)
- Ubuntu 22.04 disk not mounting persistently for k3s PV storage
- manual PV recovery after accidental kubectl delete pv
- hardening k3s local storage with Retain policy and StatefulSet safety
- smoke testing dynamic provisioning after storage reconfiguration

## Instructions

1. Pattern: map symptom → ordered checklist (ConfigMap → host path → RBAC → permissions → images → k3s manifest → AppArmor) before destructive PV/PVC deletes.
2. Pattern: Lost PVC → compare PV claimRef UID to PVC UID → patch or recreate PV against on-disk paths under nodePathMap; verify with jq smoke queries in success_criteria.

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://devops_k8s_local_storage_guru`).
