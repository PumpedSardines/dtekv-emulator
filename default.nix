{pkgs ? import <nixpkgs> {}}: let
  manifest = (pkgs.lib.importTOML ./Cargo.toml).package;
  frameworks = pkgs.darwin.apple_sdk.frameworks;
in
  pkgs.rustPlatform.buildRustPackage rec {
    pname = manifest.name;
    version = manifest.version;
    buildInputs = [
      frameworks.Cocoa
      frameworks.WebKit
      frameworks.CoreFoundation
    ];
    shellHook = ''
      export PS1="[$name] \[$txtgrn\]\u@\h\[$txtwht\]:\[$bldpur\]\w \[$txtcyn\]\$git_branch\[$txtred\]\$git_dirty \[$bldylw\]\$aws_env\[$txtrst\]\$ "
      export NIX_LDFLAGS="-F${frameworks.CoreFoundation}/Library/Frameworks -framework CoreFoundation $NIX_LDFLAGS";
    '';
    cargoLock.lockFile = ./Cargo.lock;
    cargoLock.outputHashes = {
      "dtekv_emulator-0.1.0" = "sha256-lhcWaISXFTPq+p3PQejL9kLe2JD5iD2MQI2HCjqYyxM=";
    };
    src = pkgs.lib.cleanSource ./.;
  }
