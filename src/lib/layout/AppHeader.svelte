<header class="app-header">
	<div class="brand-mark" aria-hidden="true"><span></span><span></span><span></span></div>
	<div>
		<h1>Rack Layout Designer</h1>
		<p>Plan and organize your IT infrastructure</p>
	</div>
	<span class="draft-status">Draft layout</span>
</header>

<style>
	.app-header {
		display: flex;
		align-items: center;
		gap: 12px;
		height: 68px;
		padding: 0 24px;
		border-bottom: 1px solid #dce3ec;
		background: #fff;
	}
	.brand-mark {
		display: grid;
		gap: 3px;
		width: 36px;
		height: 36px;
		padding: 7px;
		border-radius: 9px;
		background: #2563eb;
	}
	.brand-mark span {
		border: 1px solid #bfdbfe;
		border-radius: 2px;
		background: #fff;
	}
	h1,
	p {
		margin: 0;
	}
	h1 {
		color: #172033;
		font-size: 18px;
		font-weight: 700;
		letter-spacing: -0.01em;
	}
	p {
		margin-top: 2px;
		color: #667085;
		font-size: 12px;
	}
	.draft-status {
		margin-left: auto;
		padding: 5px 9px;
		border: 1px solid #dbe4f0;
		border-radius: 999px;
		color: #475467;
		background: #f8fafc;
		font-size: 12px;
		font-weight: 600;
	}
</style>
