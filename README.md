# AutowareFoxgloveConverter

An extension for Foxglove Studio/Lichtblick that provides Autoware message converters and diagnostic panels for better visualization and debugging.

Special thanks to [https://github.com/kminoda/AutowareFoxgloveConverter](https://github.com/kminoda/AutowareFoxgloveConverter) for the inspiration and the code to get started.

## Features

### Supported Message Converters
- **Perception:**
  - [autoware_auto_perception_msgs::msg::DetectedObjects](https://github.com/tier4/autoware_auto_msgs/blob/tier4/main/autoware_auto_perception_msgs/msg/DetectedObjects.idl)
  - [autoware_auto_perception_msgs::msg::TrackedObjects](https://github.com/tier4/autoware_auto_msgs/blob/tier4/main/autoware_auto_perception_msgs/msg/TrackedObjects.idl)
  - [autoware_auto_perception_msgs::msg::PredictedObjects](https://github.com/tier4/autoware_auto_msgs/blob/tier4/main/autoware_auto_perception_msgs/msg/PredictedObjects.idl)
  - [autoware_perception_msgs::msg::DetectedObjects](https://github.com/autowarefoundation/autoware_msgs/blob/main/autoware_perception_msgs/msg/DetectedObjects.msg)
  - [autoware_perception_msgs::msg::TrackedObjects](https://github.com/autowarefoundation/autoware_msgs/blob/main/autoware_perception_msgs/msg/TrackedObjects.msg)
  - [autoware_perception_msgs::msg::PredictedObjects](https://github.com/autowarefoundation/autoware_msgs/blob/main/autoware_perception_msgs/msg/PredictedObjects.msg)
- **Localization:**
  - [nav_msgs::msg::Odometry](https://docs.ros2.org/foxy/api/nav_msgs/msg/Odometry.html)

### Available Panels
- **DLR Diagnostics Result**: Display condition results from [DrivingLogReplayerv2](https://github.com/tier4/driving_log_replayer_v2)
- **Vehicle Config**: Select a vehicle to display the ego vehicle

### Available Layouts
- [DLRLayout.json](./DLRLayout.json) - Pre-configured layout for DLR diagnostics visualization

## Installation

```bash
git clone https://github.com/your-username/AutowareFoxgloveConverter.git
cd AutowareFoxgloveConverter
bash ./install.sh
```

## Usage

1. Launch Lichtblick after installation
2. Visualize your rosbag

## TODO List
- Converter for trajectory
- Converter for autoware_planning_msgs/msg/Path
- Converter for autoware_internal_planning_msgs/msg/PathWithLaneId
- Converter for planning_factor
- Status for DLR planning_factor result
- Display objects' ID
- Predicted trajectory of MPC



---
---
---


## _A Foxglove Studio Extension_

[Foxglove Studio](https://github.com/foxglove/studio) allows developers to create extensions, or custom code that is loaded and executed inside the Foxglove Studio application. This can be used to add custom panels. Extensions are authored in TypeScript using the `@foxglove/studio` SDK.

## Develop

Extension development uses the `npm` package manager to install development dependencies and run build scripts.

To install extension dependencies, run `npm` from the root of the extension package.

```sh
npm install
```

To build and install the extension into your local Foxglove Studio desktop app, run:

```sh
npm run local-install
```

Open the `Foxglove Studio` desktop (or `ctrl-R` to refresh if it is already open). Your extension is installed and available within the app.

## Package

Extensions are packaged into `.foxe` files. These files contain the metadata (package.json) and the build code for the extension.

Before packaging, make sure to set `name`, `publisher`, `version`, and `description` fields in _package.json_. When ready to distribute the extension, run:

```sh
npm run package
```

This command will package the extension into a `.foxe` file in the local directory.

## Publish

You can publish the extension for the public marketplace or privately for your organization.

See documentation here: https://foxglove.dev/docs/studio/extensions/publish#packaging-your-extension
