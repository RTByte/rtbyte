import { Colors, ZeroWidthSpace } from "#utils/constants";
import { EmbedBuilder } from "discord.js";

export class RTByteEmbed extends EmbedBuilder {
	public constructor() {
		super();
		this.setColor(Colors.White)
		this.setTimestamp()
	}

	public addBlankField() {
		this.addFields({ name: ZeroWidthSpace, value: ZeroWidthSpace });
	}
}