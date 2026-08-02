{
  description = "Collection of widgets for apathyos desktop environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

    astal = {
      url = "github:Aylur/astal";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    ags = {
      url = "github:Aylur/ags";
      inputs.astal.follows = "astal";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = {
    self,
    nixpkgs,
    ags,
    ...
  }: let
    system = "x86_64-linux";
    pkgs = nixpkgs.legacyPackages.${system};
    lib = pkgs.lib;

    basePackage = lib.importJSON ./package.json;
    pname = basePackage.name;
    pversion = basePackage.version;
    entry = basePackage.exports.default;

    source = pkgs.lib.cleanSource ./.;
    agsPkg = ags.packages.${system}.default;

    astalPackages = with ags.packages.${system}; [
      io
      astal4
      apps
      auth
      battery
      mpris
      notifd
      bluetooth
      network
      wireplumber
    ];

    runtimePackages =
      astalPackages
      ++ [
        pkgs.gjs
        pkgs.libadwaita
        pkgs.libsoup_3
        pkgs.glib-networking
      ];

    agsCli = ags.packages.${system}.default;

    agsDev = agsCli.override {
      extraPackages = runtimePackages;
    };
  in {
    packages.${system} = {
      default = pkgs.buildNpmPackage {
        inherit pname pversion;

        name = pname;
        src = source;

        npmDeps = pkgs.importNpmLock {
          npmRoot = source;
        };

        npmConfigHook = pkgs.importNpmLock.npmConfigHook;

        dontNpmBuild = true;

        nativeBuildInputs = [
          pkgs.wrapGAppsHook3
          pkgs.gobject-introspection
          agsCli
        ];

        buildInputs = runtimePackages;

        installPhase = ''
          runHook preInstall

          mkdir -p "$out/bin"

          ags bundle ${entry} "$out/bin/${pname}"

          runHook postInstall
        '';

        postFixup = ''
          wrapProgram $out/bin/apathyos-widgets --run "${agsPkg}/bin/ags quit --instance apathyos || true"
        '';
      };

      ags = ags.packages.${system}.default;
    };

    devShells.${system}.default = pkgs.mkShell {
      packages = [
        agsDev
        pkgs.glib
        pkgs.pkg-config
        pkgs.gobject-introspection
        pkgs.nodejs
        pkgs.typescript
      ];
    };
  };
}
