# Üçüncü Taraf Bileşenler
| Bileşen | Kullanım | Konum | Lisans |
|---|---|---|---|
| [three.js r128](https://threejs.org) | 3B görüntüleme | CDN (cdnjs), yedek: `vendor/three-r128/three.min.js` | MIT |
| three.js r128 eklentileri: GLTFLoader, GLTFExporter, DRACOLoader, FBXLoader, OBJLoader, MTLLoader, STLLoader, ColladaLoader, TGALoader, NURBSCurve/NURBSUtils, EffectComposer, RenderPass, ShaderPass, UnrealBloomPass, CopyShader, LuminosityHighPassShader, FXAAShader | 3B model yükleme/çevirme, görsel efektler | `vendor/three-r128/` (yedek: jsDelivr) | MIT |
| [Draco](https://github.com/google/draco) çözücü (`draco_wasm_wrapper.js`, `draco_decoder.wasm`) | Sıkıştırılmış .glb modelleri açma | `vendor/three-r128/draco/` (yedek: jsDelivr) | Apache 2.0 |
| [fflate](https://github.com/101arrowz/fflate) 0.6.9 | Sıkıştırılmış FBX dosyalarını açma | `vendor/three-r128/fflate.min.js` (yedek: jsDelivr) | MIT |
| [PeerJS](https://peerjs.com) 1.5.4 | Çevrimiçi oyun (P2P) | CDN (unpkg/jsDelivr) | MIT |
| [Chakra Petch](https://fonts.google.com/specimen/Chakra+Petch) | Yazı tipi | Google Fonts | SIL Open Font License 1.1 |

Şu an bütün 3B modeller, ses ve görseller oyun içinde kodla üretilir. `assets/models/` klasörüne eklenecek her .glb dosyasının
kaynağı ve lisansı bu tabloya yazılmalıdır (bkz. [docs/MODELLER.md](docs/MODELLER.md)).
