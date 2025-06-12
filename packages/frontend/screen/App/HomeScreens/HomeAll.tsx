import {
  View,
  Dimensions,
  RefreshControl,
  Text,
  Pressable,
  FlatList,
  ViewToken,
} from "react-native";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Fab from "../../../components/home/post/components/Fab";
import { AddIcon, ReloadIcon } from "../../../components/icons";
import PostBuilder from "../../../components/home/post/PostBuilder";
import { postLists } from "../../../data/test";
import { useNetInfo } from "@react-native-community/netinfo";
import { FlashList } from "@shopify/flash-list";
import AnimatedScreen from "../../../components/global/AnimatedScreen";
import useGetMode from "../../../hooks/GetMode";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks/hooks";
import { useGetUserQuery, useTokenValidQuery } from "../../../redux/api/user";
import { signOut } from "../../../redux/slice/user";
import { ActivityIndicator } from "react-native-paper";
import { IPost } from "../../../types/api";
import { useGetFeedQuery } from "../../../redux/api/posts";
import { openToast } from "../../../redux/slice/toast/toast";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  FadeOutDown,
  SequencedTransition,
  ZoomIn,
} from "react-native-reanimated";
import EmptyLottie from "../../../components/home/post/components/EmptyLottie";
import SkeletonGroupPost from "../../../components/home/misc/SkeletonGroupPost";
import EmptyList from "../../../components/home/misc/EmptyList";
import { resetPost } from "../../../redux/slice/post";
import { resetPost as resetFollowedPosts } from "../../../redux/slice/post/followed";
import { DrawerHomeProp, HomeProp } from "../../../types/navigation";
import storage from "../../../redux/storage";
import Robot from "../../../components/home/post/misc/Robot";
import { setPlayingIds } from "../../../redux/slice/post/audio";

export default function HomeAll() {
  const dark = useGetMode();
  const dispatch = useAppDispatch();
  const authId = useAppSelector((state) => state.user.data?.id);
  const posts = useAppSelector((state) => state.post);

  const isDark = dark;
  const color = isDark ? "white" : "black";
  const backgroundColor = !isDark ? "white" : "black";
  const height = Dimensions.get("window").height;
  const width = Dimensions.get("window").width;

  const [skip, setSkip] = useState(0);

  const [noMore, setNoMore] = useState(false);

  const { data: feedData, isLoading, error, refetch } = useGetFeedQuery({ page: 1, limit: 20 });
  const [refreshing, setRefreshing] = React.useState(false);
  // Feed is automatically loaded by useGetFeedQuery
  const onRefresh = useCallback(() => {
    if (!authId) return;
    setRefreshing(true);
    refetch()
      .then(() => {
        setRefreshing(false);
      })
      .catch(() => {
        setRefreshing(false);
        dispatch(
          openToast({ text: "Couldn't get recent posts", type: "Failed" })
        );
      });
  }, [authId, dispatch, refetch]);

  const renderFooter = () => {
    if (feedData?.pagination?.hasMore === false) {
      return (
        <View
          style={{
            width: "100%",
            marginTop: 20,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Robot />
        </View>
      );
    } else if (isLoading) {
      return (
        <Animated.View
          style={{
            marginTop: 20,
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator color={color} size={20} />
        </Animated.View>
      );
    }
  };

  // useEffect(() => {
  //   if (skip !== 0 && !noMore && !posts.loading)
  //     getLazyPost({ take: 10, skip })
  //       .unwrap()
  //       .then((r) => {
  //         setSkip(r.posts?.length || 0);
  //         setNoMore(r.posts?.length === 0);
  //       })
  //       .catch((e) => {
  //         dispatch(
  //           openToast({ text: "couldn't get recent posts", type: "Failed" })
  //         );
  //       });
  // }, [skip, noMore]);

  // No longer needed - useGetFeedQuery handles initial load

  const fetchMoreData = () => {
    // For MVP, we'll just show a single page of posts
    // Pagination can be implemented later
  };
  const handleRefetch = () => {
    refetch();
  };

  const [indexInView, setIndexInView] = useState<Array<number | null>>([]);

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <PostBuilder
      id={item.id}
      isReposted={false}
      date={item.createdAt}
      link={""}
      comments={item._count?.comments || 0}
      like={item._count?.likes || 0}
      isLiked={false}
      photo={undefined}
      thumbNail={""}
      imageUri={item.author?.avatar}
      name={item.author?.name}
      userId={item.author?.id}
      userTag={item.author?.username}
      verified={false}
      audioUri={undefined}
      photoUri={""}
      videoTitle={undefined}
      videoUri={undefined}
      postText={item.content}
      videoViews={"0"}
      idx={index}
    />
  );
  const keyExtractor = (item: any) => item?.id?.toString();

  const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);
  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50, // This means a component is considered visible if at least 50% of it is visible
  };

  const onViewableItemsChanged = useRef<
    ({
      viewableItems,
      changed,
    }: {
      viewableItems: Array<ViewToken>;
      changed: Array<ViewToken>;
    }) => void
  >(({ viewableItems, changed }) => {
    console.log("Viewable Items:", viewableItems);
    const indexes: Array<number | null> = [];
    viewableItems.map((view) => {
      indexes.push(view.index);
    });
    setIndexInView(indexes);
    dispatch(setPlayingIds(indexes));
    console.log("view", indexes);
    console.log("Changed in this interaction:", changed);
  });

  const getItemLayout = (data, index) => ({
    length: data[index].height,
    offset: data.slice(0, index).reduce((acc, item) => acc + item.height, 0),
    index,
  });

  const posts = feedData?.posts || [];
  
  return (
    <View style={{ flex: 1 }}>
      {isLoading && posts.length === 0 ? (
        <SkeletonGroupPost />
      ) : posts.length === 0 ? (
        <EmptyList handleRefetch={handleRefetch} />
      ) : (
        <Animated.View style={{ flex: 1 }}>
          <FlashList
            data={posts}
            decelerationRate={0.991}
            estimatedItemSize={100}
            ListFooterComponent={renderFooter}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["red", "blue"]}
              />
            }
            keyExtractor={keyExtractor}
            estimatedListSize={{ width: width, height: height }}
            onEndReachedThreshold={0.3}
            onEndReached={fetchMoreData}
            renderItem={renderItem}
            contentContainerStyle={{ paddingTop: 100, paddingBottom: 100 }}
          />
        </Animated.View>
      )}
      <Fab item={<AddIcon size={30} color={color} />} />
    </View>
  );
}
