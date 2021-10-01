import { StatusBar } from "expo-status-bar";
import React, { useContext, Context, createContext } from "react";
import {
  StyleSheet,
  FlatList,
  Text,
  TouchableHighlight,
  View,
} from "react-native";
import { useState, useEffect } from "react";
import * as FileSystem from "expo-file-system";
import UrlResolver from "relative-url-resolver";
import { Entypo, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

let FileBrowserContext = createContext();
let initialState = {
  path: null,
  files: [
    {
      path: FileSystem.documentDirectory,
      name: "Documents",
      type: "place",
      icon: "place",
    },
    {
      path: FileSystem.cacheDirectory,
      name: "Cache",
      type: "place",
      icon: "place",
    },
  ],
};

console.log(initialState);
(async () => {
  await FileSystem.writeAsStringAsync(
    FileSystem.cacheDirectory + "hello.txt",
    "Hello World"
  );
  let result = await FileSystem.readDirectoryAsync(FileSystem.cacheDirectory);
  console.log(result);
  let fullpath = UrlResolver.resolve("hello.txt", FileSystem.cacheDirectory);
  console.log(fullpath);
  let contents = await FileSystem.readAsStringAsync(fullpath);
  console.log(contents);
  let dirUrl = UrlResolver.resolve("sometext", FileSystem.cacheDirectory);
  console.log(dirUrl);
  try {
    await FileSystem.makeDirectoryAsync(dirUrl);
  } catch (e) {
    console.log(e.message);
  }

  let fullpath2 = UrlResolver.resolve("hello.txt", dirUrl + "/");
  console.log(fullpath2);
  await FileSystem.writeAsStringAsync(fullpath2, "Hello World");
  await FileSystem.writeAsStringAsync(
    dirUrl + "/another.txt",
    "Muscles Marinara"
  );
  let result2 = await FileSystem.readDirectoryAsync(dirUrl);
  console.log(result2);
})();

export default function App() {
  let [fileBrowserState, setFileBrowserState] = useState(initialState);
  let { path, files } = fileBrowserState;

  let navigateTo = (newPath) => {
    (async () => {
      let newUrl = UrlResolver.resolve(newPath, path);
      let x = await FileSystem.readDirectoryAsync(newUrl);
      let newFiles = [];
      for (let i = 0; i < x.length; i++) {
        let file = x[i];
        let fileUrl = UrlResolver.resolve(file, newUrl);
        let fileInfo = await FileSystem.getInfoAsync(fileUrl);
        newFiles.push({
          path: fileUrl,
          name: file,
          type: fileInfo.isDirectory ? "folder" : "file",
          icon: fileInfo.isDirectory ? "folder" : "file",
        });
      }

      let newState = {
        path: newUrl,
        files: newFiles,
      };
      setFileBrowserState(newState);
    })();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <FileList
        files={files}
        navigateTo={navigateTo}
        back={() => {
          navigateTo("../");
        }}
        home={() => {
          setFileBrowserState(initialState);
        }}
      />
    </View>
  );
}

function FileList(props, context) {
  return (
    <View
      style={{
        marginTop: 40,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
        }}
      >
        <TouchableHighlight
          onPress={() => {
            props.back();
          }}
        >
          <Ionicons name="arrow-back" size={32} color="#666666" />
        </TouchableHighlight>
        <TouchableHighlight
          onPress={() => {
            props.home();
          }}
        >
          <Entypo name="home" size={32} color="#666666" />
        </TouchableHighlight>
      </View>
      <FlatList
        data={props.files}
        renderItem={({ item }) => (
          <FileItem file={item} navigateTo={props.navigateTo} />
        )}
        keyExtractor={(item) => item.path}
      />
    </View>
  );
}

function FileItem(props, context) {
  let icon = null;
  switch (props.file.icon) {
    case "folder":
      icon = <Entypo name="folder" size={32} color="#666666" />;
      break;
    case "place":
      icon = (
        <Ionicons name="file-tray-full-outline" size={32} color="#666666" />
      );
      // icon = <Entypo name="documents" size={32} color="#666666" />;
      break;
    case "file":
      icon = <Ionicons name="document-outline" size={32} color="#666666" />;
      break;
    default:
      icon = <Ionicons name="document" size={32} color="#666666" />;
      break;
  }
  return (
    <TouchableHighlight
      onPress={() => {
        console.log("tapped " + JSON.stringify(props.file));
        props.navigateTo(props.file.path);
      }}
    >
      <View
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 12,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            
          }}
        >
          <View style={{
            paddingRight: 12
          }}>
          {icon}
          </View>
          <View>
            <Text>{props.file.name}</Text>
            <Text
              style={{
                fontSize: 6,
                color: "#aaaaaa",
              }}
            >
              {props.file.path}
            </Text>
          </View>
        </View>
      </View>
    </TouchableHighlight>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
