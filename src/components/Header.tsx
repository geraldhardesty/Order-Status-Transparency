export function Header() {
  return (
    <>
      <div className="brand-stripe" />
      <header className="app-header">
        <div className="app-header__inner">
          <div className="app-header__mark">
            YOKOGAWA<span>.</span>
          </div>
          <div className="app-header__divider" />
          <div className="app-header__product">Order Status Transparency</div>
          <div className="app-header__spacer" />
          <div className="app-header__env">Demo Data</div>
        </div>
      </header>
    </>
  );
}
