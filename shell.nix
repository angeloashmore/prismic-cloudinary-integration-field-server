with import <nixpkgs> {};

stdenv.mkDerivation {
  name = "node";
  buildInputs = [
    yarn
    nodejs-14_x
  ];
}
