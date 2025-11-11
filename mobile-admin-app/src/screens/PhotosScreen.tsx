import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, LAYOUT, SHADOWS } from '../constants/theme';
import { photosAPI } from '../services/api';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const IMAGE_SIZE = (width - SIZES.padding * 2 - SIZES.paddingSm * (COLUMN_COUNT - 1)) / COLUMN_COUNT;

interface Photo {
  id: string;
  publicId: string;
  url: string;
  thumbnailUrl: string;
  title?: string;
  category?: string;
  uploadedAt: string;
}

const PhotosScreen = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      const data = await photosAPI.getAll();
      setPhotos(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load photos');
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPhotos();
  };

  const handleSync = async () => {
    Alert.alert(
      'Sync Photos',
      'Sync all photos from Cloudinary? This may take a moment.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sync',
          onPress: async () => {
            setSyncing(true);
            try {
              await photosAPI.sync();
              Alert.alert('Success', 'Photos synced successfully!');
              loadPhotos();
            } catch (error) {
              Alert.alert('Error', 'Failed to sync photos');
              console.error(error);
            } finally {
              setSyncing(false);
            }
          },
        },
      ]
    );
  };

  const handleDelete = async (photo: Photo) => {
    Alert.alert(
      'Delete Photo',
      `Delete "${photo.title || 'this photo'}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await photosAPI.delete(photo.id);
              Alert.alert('Success', 'Photo deleted successfully');
              loadPhotos();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete photo');
              console.error(error);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderPhotoItem = ({ item }: { item: Photo }) => (
    <TouchableOpacity
      style={styles.photoItem}
      onPress={() => setSelectedPhoto(item)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.thumbnailUrl || item.url }}
        style={styles.photoImage}
        resizeMode="cover"
      />
      {item.category && (
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText} numberOfLines={1}>
            {item.category}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderPhotoModal = () => {
    if (!selectedPhoto) return null;

    return (
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalCloseArea}
          onPress={() => setSelectedPhoto(null)}
          activeOpacity={1}
        >
          <View style={styles.modalContent}>
            <Image
              source={{ uri: selectedPhoto.url }}
              style={styles.modalImage}
              resizeMode="contain"
            />
            <View style={styles.modalInfo}>
              <Text style={styles.modalTitle}>
                {selectedPhoto.title || 'Untitled'}
              </Text>
              <Text style={styles.modalDate}>
                Uploaded: {formatDate(selectedPhoto.uploadedAt)}
              </Text>
              {selectedPhoto.category && (
                <Text style={styles.modalCategory}>
                  Category: {selectedPhoto.category}
                </Text>
              )}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={() => {
                  setSelectedPhoto(null);
                  handleDelete(selectedPhoto);
                }}
              >
                <Ionicons name="trash" size={20} color={COLORS.textDark} />
                <Text style={styles.modalButtonText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.closeButton]}
                onPress={() => setSelectedPhoto(null)}
              >
                <Ionicons name="close" size={20} color={COLORS.textDark} />
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading photos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="images" size={24} color={COLORS.primary} />
          <Text style={styles.headerTitle}>Gallery ({photos.length})</Text>
        </View>
        <TouchableOpacity
          style={[styles.syncButton, syncing && styles.syncButtonDisabled]}
          onPress={handleSync}
          disabled={syncing}
        >
          <Ionicons
            name="sync"
            size={20}
            color={syncing ? COLORS.textLight : COLORS.textDark}
          />
          <Text style={styles.syncButtonText}>
            {syncing ? 'Syncing...' : 'Sync'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={photos}
        renderItem={renderPhotoItem}
        keyExtractor={(item) => item.id}
        numColumns={COLUMN_COUNT}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="image-outline" size={64} color={COLORS.textLight} />
            <Text style={styles.emptyText}>No photos found</Text>
            <Text style={styles.emptySubtext}>
              Tap "Sync" to load photos from Cloudinary
            </Text>
          </View>
        }
      />

      {selectedPhoto && renderPhotoModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SIZES.padding,
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: SIZES.paddingSm,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.paddingSm,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusMd,
  },
  syncButtonDisabled: {
    backgroundColor: COLORS.textLight,
  },
  syncButtonText: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.textDark,
    marginLeft: 4,
  },
  listContent: {
    padding: SIZES.padding,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  photoItem: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    marginBottom: SIZES.paddingSm,
    borderRadius: SIZES.radiusMd,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  photoImage: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.surface,
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  categoryText: {
    fontSize: SIZES.xs,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.xxxl * 2,
  },
  emptyText: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: SIZES.padding,
  },
  emptySubtext: {
    fontSize: SIZES.sm,
    color: COLORS.textLight,
    marginTop: 4,
    textAlign: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '90%',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    overflow: 'hidden',
    ...SHADOWS.large,
  },
  modalImage: {
    width: '100%',
    height: 300,
    backgroundColor: COLORS.background,
  },
  modalInfo: {
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  modalDate: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  modalCategory: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    padding: SIZES.padding,
    gap: SIZES.paddingSm,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.padding,
    borderRadius: SIZES.radiusMd,
    gap: 8,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
  },
  closeButton: {
    backgroundColor: COLORS.textSecondary,
  },
  modalButtonText: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textDark,
  },
});

export default PhotosScreen;
