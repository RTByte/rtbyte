import { Precondition } from '@sapphire/framework';

export class UserPrecondition extends Precondition {
	public async run() {
		return this.ok();
	}
}
