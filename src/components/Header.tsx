export function Header() {
  return (
    <>
      <header className="app-header">
        <div className="app-header__inner">
          <div className="app-header__logo">
            <span className="app-header__wordmark">YOKOGAWA</span>
            <span className="app-header__diamond" aria-hidden="true" />
          </div>
          <div className="app-header__divider" />
          <div className="app-header__product">Order Status Transparency</div>
          <div className="app-header__spacer" />
          <div className="app-header__env">Demo Data</div>
        </div>
      </header>
      <div className="brand-stripe" />
    </>
  );
}
