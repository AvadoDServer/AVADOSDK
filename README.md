# AVADO SDK

Tools to create your own AVADO compatible packages.

## Install

Install straight from github using this command:

`npm i -g git+https://github.com/AvadoDServer/AVADOSDK.git`

## Usage

```
mkdir mypackage
cd mypackage
avadosdk init
(then answer these questions)
? AVADO package name mypackage.avado.dappnode.eth
? Version 0.0.1
? Description mypackageavado.dappnode.eth description
? Author sponnet
? License GLP-3.0
```

Now you have a package template

try building it - connect to your AVADO (for IPFS access) and type

```
avadosdk build

  ✔ Create release dir
  ✔ Copy files and validate
  ✔ Build docker image
  ✔ Save and compress image
  ✔ Upload avatar to IPFS
  ✔ Upload image to IPFS
  ✔ Upload manifest to IPFS
  ✔ Save upload results

  package built and uploaded
  Manifest hash : /ipfs/QmZ1xDukvh2gimJ3JbSrn7MvsibA9X2QuRRBGzFwFeNo9E
  
```

now go to your AVADO http://my.avado/#/installer and paste the IPFS hash in the search field above.

![image](https://user-images.githubusercontent.com/596726/125915068-3b40a382-7eb9-4244-81f3-2e3462f93ae5.png)

now you can install your package and test it out !

![image](https://user-images.githubusercontent.com/596726/125915259-9952c85e-5f83-4f0a-ad7a-399521a4a984.png)

It's running

![image](https://user-images.githubusercontent.com/596726/125915311-51d1a85d-c617-48c8-a198-c22f221daa31.png)

Success !








