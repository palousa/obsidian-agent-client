/**
 * HeartbeatManager
 *
 * Periodically injects a standing-instructions prompt (HEARTBEAT.md) into
 * the active chat session. The chat agent handles it like any other message —
 * same context, same tools, same conversation history.
 *
 * No separate ACP process. The heartbeat is just an automated "enter."
 */

import { getLogger } from "./logger";
import type AgentClientPlugin from "../plugin";

export class HeartbeatManager {
	private intervalId: number | null = null;
	private tickInProgress = false;
	private logger = getLogger();

	constructor(private plugin: AgentClientPlugin) {}

	// ── lifecycle ──────────────────────────────────────────────────────────

	start(): void {
		if (!this.plugin.settings.heartbeat.enabled) return;
		this.stop();

		const intervalMs =
			this.plugin.settings.heartbeat.intervalMinutes * 60_000;

		this.intervalId = window.setInterval(() => {
			void this.tick();
		}, intervalMs);
		this.plugin.registerInterval(this.intervalId);

		this.logger.log(
			`[Heartbeat] Started — interval ${this.plugin.settings.heartbeat.intervalMinutes}m`,
		);
	}

	stop(): void {
		if (this.intervalId !== null) {
			window.clearInterval(this.intervalId);
			this.intervalId = null;
		}
		this.logger.log("[Heartbeat] Stopped");
	}

	restart(): void {
		this.stop();
		this.start();
	}

	// ── core loop ──────────────────────────────────────────────────────────

	private async tick(): Promise<void> {
		if (this.tickInProgress) {
			this.logger.log("[Heartbeat] tick skipped — previous still running");
			return;
		}
		this.tickInProgress = true;
		try {
			await this.tickInner();
		} finally {
			this.tickInProgress = false;
		}
	}

	private async tickInner(): Promise<void> {
		// Always export sessions, even outside active hours
		try {
			await this.plugin.exportAllSessions(false);
		} catch (err) {
			this.logger.error("[Heartbeat] session export failed:", err);
		}

		if (!this.isWithinActiveHours()) {
			this.logger.log("[Heartbeat] tick (outside active hours) — export only");
			return;
		}

		const instructions = await this.readInstructions();
		if (!instructions) {
			this.logger.log("[Heartbeat] no instructions file — skipping");
			return;
		}

		// Get the active chat view
		const view = this.plugin.viewRegistry.getFocused();
		if (!view) {
			this.logger.log("[Heartbeat] no active chat view — skipping");
			return;
		}

		// Send the heartbeat prompt directly (bypasses React state closure issue).
		// sendMessage() internally checks isSending/isSessionReady and returns false if busy.
		const prompt = `[Heartbeat tick]\n\n${instructions}`;
		const sent = await view.sendMessage(prompt);
		this.logger.log(`[Heartbeat] tick sent: ${sent}`);
	}

	// ── instructions file ──────────────────────────────────────────────────

	private async readInstructions(): Promise<string | null> {
		const filePath = this.plugin.settings.heartbeat.filePath;
		const file = this.plugin.app.vault.getAbstractFileByPath(filePath);
		if (!file) return null;
		try {
			return await this.plugin.app.vault.cachedRead(file as any);
		} catch {
			return null;
		}
	}

	// ── helpers ─────────────────────────────────────────────────────────────

	private isWithinActiveHours(): boolean {
		const { activeHoursStart, activeHoursEnd } =
			this.plugin.settings.heartbeat;
		if (activeHoursStart === 0 && activeHoursEnd === 0) return true;

		const hour = new Date().getHours();
		if (activeHoursStart <= activeHoursEnd) {
			return hour >= activeHoursStart && hour < activeHoursEnd;
		}
		return hour >= activeHoursStart || hour < activeHoursEnd;
	}
}
