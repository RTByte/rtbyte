export const list = (values: readonly string[], conjunction: 'or' | 'and') => {
	switch (values.length) {
		case 0:
			return '';
		case 1:
			return values[0];
		case 2:
			return `${values[0]} ${conjunction} ${values[1]}`;
		default: {
			const trail = values.slice(0, -1);
			const head = values[values.length - 1];
			return `${trail.join(', ')}, ${conjunction} ${head}`;
		}
	}
};
