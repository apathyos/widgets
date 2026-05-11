{
  description = "Collection of widgets for apathyos desktop environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

    ags = {
      url = "github:Aylur/ags";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    {
      self,
      nixpkgs,
      ags,
      ...
    }:
    let
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};
      lib = pkgs.lib;

      basePackage = lib.importJSON ./package.json;
      baseLock = lib.importJSON ./package-lock.json;

      pname = basePackage.name or "apathyos-widgets";
      pversion = basePackage.version or "0.1.0";
      agsVersion = basePackage.config.ags.version;
      gnimVersion = basePackage.config.gnim.version;

      agsPkg = ags.packages.${system}.default;

      astalPackages = with ags.packages.${system}; [
        io
        astal4
        apps
        battery
        mpris
        notifd
        bluetooth
        network
        wireplumber
      ];

      extraPackages = astalPackages ++ [
        pkgs.libadwaita
        pkgs.libsoup_3
      ];

      dropAgsGnim =
        attrs:
        removeAttrs attrs [
          "ags"
          "gnim"
        ];

      nixPackage = basePackage // {
        dependencies = dropAgsGnim basePackage.dependencies;
        devDependencies = dropAgsGnim basePackage.devDependencies;
      };

      nixPackageLock = baseLock // {
        packages = removeAttrs (baseLock.packages or { }) [
          "node_modules/ags"
          "node_modules/gnim"
        ];
        dependencies = dropAgsGnim (baseLock.dependencies or { });
      };

      agsSrc = pkgs.fetchFromGitHub {
        owner = "Aylur";
        repo = "ags";
        rev = "v${agsVersion}";
        hash = "sha256-tM3s7CX+tgxlYW0Sk3nzVThg2MHn08foIuMxABupxIs=";
      };

      gnimSrc = pkgs.fetchFromGitHub {
        owner = "Aylur";
        repo = "gnim";
        rev = "v${gnimVersion}";
        hash = "sha256-yslzUPALGrK9b59UBcjPZe6QtKwPwa7/x5dowy8Igv4=";
      };

      agsNodePackage = pkgs.runCommand "ags-node-package" { } ''
        mkdir -p $out/node_modules/ags
        cp ${agsSrc}/package.json $out/node_modules/ags/package.json
        cp -r ${agsSrc}/lib $out/node_modules/ags/lib
      '';

      gnimNodePackage = pkgs.stdenv.mkDerivation (finalAttrs: {
        pname = "gnim-node-package";
        version = gnimVersion;
        src = gnimSrc;

        nativeBuildInputs = [
          pkgs.nodejs
          pkgs.pnpm_10
          pkgs.pnpmConfigHook
          pkgs.glib
          pkgs.bash
        ];

        pnpmDeps = pkgs.fetchPnpmDeps {
          inherit (finalAttrs) pname version src;
          pnpm = pkgs.pnpm_10;
          fetcherVersion = 3;
          hash = "sha256-azIaHmaawxZ3grABm7ItbNFeUJknQkClimxagrtj5yI=";
        };

        postPatch = ''
          patchShebangs --build ./scripts
        '';

        buildPhase = ''
          runHook preBuild
          pnpm run build
          runHook postBuild
        '';

        installPhase = ''
          runHook preInstall
          mkdir -p $out/node_modules/gnim
          cp package.json $out/node_modules/gnim/package.json
          cp -r dist $out/node_modules/gnim/dist
          runHook postInstall
        '';
      });
    in
    {
      packages.${system} = {
        default = pkgs.buildNpmPackage {
          name = pname;
          version = pversion;
          src = ./.;

          npmDeps = pkgs.importNpmLock {
            package = nixPackage;
            packageLock = nixPackageLock;
          };
          npmConfigHook = pkgs.importNpmLock.npmConfigHook;

          nativeBuildInputs = with pkgs; [
            wrapGAppsHook3
            gobject-introspection
            ags.packages.${system}.default
          ];

          buildInputs = extraPackages ++ [
            pkgs.glib
            pkgs.gjs
          ];

          dontNpmBuild = true;
          dontNpmPrune = true;

          installPhase = ''
            runHook preInstall

            mkdir -p node_modules
            mkdir -p $out/bin

            ln -s ${agsNodePackage}/node_modules/ags node_modules/ags
            ln -s ${gnimNodePackage}/node_modules/gnim node_modules/gnim

            ags bundle modules/TopBarModule.tsx $out/bin/top-bar-module
            ags bundle modules/StatusPanelModule.tsx $out/bin/status-panel-module
            ags bundle modules/NotificationLayerModule.tsx $out/bin/notification-layer-module

            runHook postInstall
          '';

          postFixup = ''
            wrapProgram $out/bin/top-bar-module --run "${agsPkg}/bin/ags quit --instance top-bar || true"
            wrapProgram $out/bin/status-panel-module --run "${agsPkg}/bin/ags quit --instance status-panel || true"
            wrapProgram $out/bin/notification-layer-module --run "${agsPkg}/bin/ags quit --instance notification-layer || true"
          '';
        };

        ags = ags.packages.${system}.default;
      };

      devShells.${system} = {
        default = pkgs.mkShell {
          packages = with pkgs; [
            pnpm
            glib
            pkg-config
            gobject-introspection
          ];
          buildInputs = [
            (ags.packages.${system}.default.override {
              inherit extraPackages;
            })
          ];
        };
      };
    };
}
