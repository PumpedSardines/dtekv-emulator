
{pkgs ? import <nixpkgs> {}}: let
  manifest = (pkgs.lib.importTOML ./Cargo.toml).package;
  frameworks = pkgs.darwin.apple_sdk.frameworks;
in
  pkgs.rustPlatform.buildRustPackage rec {
    pname = manifest.name;
    version = manifest.version;
    buildInputs = [
    frameworks.AGL
    frameworks.AVFoundation
    frameworks.AVKit
    frameworks.Accelerate
    frameworks.Accounts
    frameworks.AddressBook
    frameworks.AppKit
    frameworks.AppleScriptKit
    frameworks.AppleScriptObjC
    frameworks.ApplicationServices
    frameworks.AudioToolbox
    frameworks.AudioUnit
    frameworks.AudioVideoBridging
    frameworks.Automator
    frameworks.CFNetwork
    frameworks.CalendarStore
    frameworks.Carbon
    frameworks.Cocoa
    frameworks.Collaboration
    frameworks.ContactsPersistence
    frameworks.CoreAudio
    frameworks.CoreAudioKit
    frameworks.CoreBluetooth
    frameworks.CoreData
    frameworks.CoreFoundation
    frameworks.CoreGraphics
    frameworks.CoreImage
    frameworks.CoreLocation
    frameworks.CoreMIDI
    frameworks.CoreMIDIServer
    frameworks.CoreMedia
    frameworks.CoreMediaIO
    frameworks.CoreServices
    frameworks.CoreSymbolication
    frameworks.CoreText
    frameworks.CoreVideo
    frameworks.CoreWLAN
    frameworks.DVDPlayback
    frameworks.DebugSymbols
    frameworks.DirectoryService
    frameworks.DiscRecording
    frameworks.DiscRecordingUI
    frameworks.DiskArbitration
    frameworks.DisplayServices
    frameworks.EventKit
    frameworks.ExceptionHandling
    frameworks.FWAUserLib
    frameworks.ForceFeedback
    frameworks.Foundation
    frameworks.GLKit
    frameworks.GLUT
    frameworks.GSS
    frameworks.GameController
    frameworks.GameKit
    frameworks.GameplayKit
    frameworks.Hypervisor
    frameworks.ICADevices
    frameworks.IMServicePlugIn
    frameworks.IOBluetooth
    frameworks.IOBluetoothUI
    frameworks.IOKit
    frameworks.IOSurface
    frameworks.ImageCaptureCore
    frameworks.ImageIO
    frameworks.InputMethodKit
    frameworks.InstallerPlugins
    frameworks.InstantMessage
    frameworks.JavaNativeFoundation
    frameworks.JavaRuntimeSupport
    frameworks.JavaScriptCore
    frameworks.JavaVM
    frameworks.Kerberos
    frameworks.Kernel
    frameworks.LDAP
    frameworks.LatentSemanticMapping
    frameworks.LocalAuthentication
    frameworks.MapKit
    frameworks.MediaAccessibility
    frameworks.MediaPlayer
    frameworks.MediaToolbox
    frameworks.Metal
    frameworks.MetalKit
    frameworks.ModelIO
    frameworks.MultitouchSupport
    frameworks.NetFS
    frameworks.OSAKit
    frameworks.OpenAL
    frameworks.OpenCL
    frameworks.OpenDirectory
    frameworks.OpenGL
    frameworks.PCSC
    frameworks.PreferencePanes
    frameworks.QTKit
    frameworks.Quartz
    frameworks.QuartzCore
    frameworks.QuickLook
    frameworks.QuickTime
    frameworks.SceneKit
    frameworks.ScreenSaver
    frameworks.ScriptingBridge
    frameworks.Security
    frameworks.SecurityFoundation
    frameworks.SecurityInterface
    frameworks.ServiceManagement
    frameworks.SkyLight
    frameworks.Social
    frameworks.SpriteKit
    frameworks.StoreKit
    frameworks.SyncServices
    frameworks.System
    frameworks.SystemConfiguration
    frameworks.TWAIN
    frameworks.Tcl
    frameworks.UIFoundation
    frameworks.VideoDecodeAcceleration
    frameworks.VideoToolbox
    frameworks.WebKit
    frameworks.vmnet
    ];
    shellHook = ''
      export PS1="[$name] \[$txtgrn\]\u@\h\[$txtwht\]:\[$bldpur\]\w \[$txtcyn\]\$git_branch\[$txtred\]\$git_dirty \[$bldylw\]\$aws_env\[$txtrst\]\$ "
      export NIX_LDFLAGS="-F${frameworks.CoreFoundation}/Library/Frameworks -framework CoreFoundation $NIX_LDFLAGS";
    '';
    cargoLock.lockFile = ./Cargo.lock;
    src = pkgs.lib.cleanSource ./.;
  }
