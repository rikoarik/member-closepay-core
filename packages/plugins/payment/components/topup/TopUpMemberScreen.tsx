/**
 * Top Up Member Screen
 * Screen untuk isi saldo member dengan tabs (ID Member, Excel, Top Kartu)
 * Responsive untuk semua device termasuk EDC
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { ArrowLeft2, ArrowDown2 } from 'iconsax-react-nativejs';
import {
  scale,
  moderateScale,
  moderateVerticalScale,
  getHorizontalPadding,
  getMinTouchTarget,
  getResponsiveFontSize,
  getIconSize,
  FontFamily,
  useDimensions,
  TabSwitcher,
  type Tab,
} from '@core/config';
import {
  nfcBluetoothService,
  type NFCCardData,
  type BluetoothDevice,
} from '../../services/nfcBluetoothService';
import { BluetoothDeviceSelector } from '../shared/BluetoothDeviceSelector';
import { NFCLoadingModal } from '../shared/NFCLoadingModal';
import {
  TopUpMemberSummaryBottomSheet,
  type TopUpMemberSummaryData,
} from './TopUpMemberSummaryBottomSheet';
import {
  TopUpMemberPinBottomSheet,
  type TopUpMemberPinData,
} from './TopUpMemberPinBottomSheet';

type TabType = 'id-member' | 'excel' | 'top-kartu';

interface BalanceTarget {
  id: string;
  name: string;
}

const BALANCE_TARGETS: BalanceTarget[] = [
  { id: 'saldo-plaafon', name: 'Saldo Plaafon' },
  { id: 'saldo-utama', name: 'Saldo Utama' },
  { id: 'saldo-bonus', name: 'Saldo Bonus' },
];

export const TopUpMemberScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useDimensions();
  const [activeTab, setActiveTab] = useState<TabType>('id-member');
  const [balanceTarget, setBalanceTarget] = useState<string>('saldo-plaafon');
  const [amount, setAmount] = useState('50000');
  const [memberId, setMemberId] = useState('JK-4P');
  const [showBalanceDropdown, setShowBalanceDropdown] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [excelFile, setExcelFile] = useState<string | null>(null);
  const [cardData, setCardData] = useState<NFCCardData | null>(null);
  const [isNFCListening, setIsNFCListening] = useState(false);
  const [nfcError, setNfcError] = useState<string | null>(null);
  const [isBluetoothScanning, setIsBluetoothScanning] = useState(false);
  
  // NFC Health & Bluetooth states
  const [nfcHealthStatus, setNfcHealthStatus] = useState<'available' | 'unavailable' | 'broken' | 'checking'>('checking');
  const [showBluetoothOption, setShowBluetoothOption] = useState(false);
  const [showBluetoothSelector, setShowBluetoothSelector] = useState(false);
  const [selectedBluetoothDevice, setSelectedBluetoothDevice] = useState<BluetoothDevice | null>(null);
  const [isConnectingBluetooth, setIsConnectingBluetooth] = useState(false);
  const [isBluetoothConnected, setIsBluetoothConnected] = useState(false);
  const [isReadingViaBluetooth, setIsReadingViaBluetooth] = useState(false);
  
  // Summary Bottom Sheet
  const [showSummaryBottomSheet, setShowSummaryBottomSheet] = useState(false);
  const [summaryData, setSummaryData] = useState<TopUpMemberSummaryData | null>(null);
  
  // PIN Bottom Sheet
  const [showPinBottomSheet, setShowPinBottomSheet] = useState(false);
  const [pinData, setPinData] = useState<TopUpMemberPinData | null>(null);
  
  // Animated scroll for horizontal pager
  const pagerRef = useRef<any>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  
  // Dropdown animation
  const dropdownAnimation = useRef(new Animated.Value(0)).current;
  const dropdownOpacity = useRef(new Animated.Value(0)).current;
  
  // ScrollView refs for keyboard handling
  const idMemberScrollRef = useRef<ScrollView>(null);
  const excelScrollRef = useRef<ScrollView>(null);
  
  // Tabs configuration
  const tabs: Tab[] = [
    { id: 'id-member', label: 'ID Member' },
    { id: 'excel', label: 'Excel' },
    { id: 'top-kartu', label: 'Tap Kartu' },
  ];
  
  // Get tab index for pager
  const getTabIndex = (tab: TabType): number => {
    switch (tab) {
      case 'id-member':
        return 0;
      case 'excel':
        return 1;
      case 'top-kartu':
        return 2;
      default:
        return 0;
    }
  };
  
  // Handle pager scroll end
  const handlePagerMomentumEnd = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / screenWidth);
    
    const tabs: TabType[] = ['id-member', 'excel', 'top-kartu'];
    if (tabs[index]) {
      setActiveTab(tabs[index]);
    }
  };
  
  // Handle tab change and sync pager
  const handleTabChange = (tabId: string) => {
    const typed = tabId as TabType;
    setActiveTab(typed);
    if (pagerRef.current) {
      const index = getTabIndex(typed);
      pagerRef.current.scrollTo({
        x: index * screenWidth,
        animated: true,
      });
    }
  };
  
  // Set initial pager position
  useEffect(() => {
    if (pagerRef.current) {
      const initialIndex = getTabIndex('id-member');
      pagerRef.current.scrollTo({
        x: initialIndex * screenWidth,
        animated: false,
      });
    }
  }, [screenWidth]);

  // Debug logging for bottom sheet
  useEffect(() => {
    console.log('Bottom sheet state changed:', { showSummaryBottomSheet, hasData: !!summaryData });
  }, [showSummaryBottomSheet, summaryData]);

  // Animate dropdown when showBalanceDropdown changes
  useEffect(() => {
    if (showBalanceDropdown) {
      setIsDropdownVisible(true);
      Animated.parallel([
        Animated.spring(dropdownAnimation, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(dropdownOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (isDropdownVisible) {
      // Animate out - pastikan animasi hide terlihat
      Animated.parallel([
        Animated.spring(dropdownAnimation, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(dropdownOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsDropdownVisible(false);
      });
    }
  }, [showBalanceDropdown, isDropdownVisible, dropdownAnimation, dropdownOpacity]);

  const formatCurrency = (value: string): string => {
    const numericValue = value.replace(/\D/g, '');
    if (!numericValue) return '';
    return parseInt(numericValue, 10).toLocaleString('id-ID');
  };

  const handleAmountChange = (text: string) => {
    const numericValue = text.replace(/\D/g, '');
    setAmount(numericValue);
  };

  const handleExcelUpload = () => {
    // TODO: Implement file picker
    // For now, mock file selection
    setExcelFile('File1.xsl');
  };

  const handleDownloadTemplate = () => {
    // TODO: Implement template download
    console.log('Download template');
  };

  /**
   * Check NFC health when Tap Kartu tab is active
   */
  useEffect(() => {
    if (activeTab === 'top-kartu') {
      checkNFCHealth();
    } else {
      // Reset states when leaving tab
      setNfcHealthStatus('checking');
      setShowBluetoothOption(false);
      stopNFCListener();
    }
  }, [activeTab]);

  /**
   * Start NFC listener when NFC is available and tab is active
   */
  useEffect(() => {
    if (activeTab === 'top-kartu' && !cardData && nfcHealthStatus === 'available' && !isBluetoothConnected) {
      // Start listener when NFC is available
      startNFCListener();
    } else {
      // Stop listener otherwise
      stopNFCListener();
    }

    return () => {
      // Cleanup on unmount
      stopNFCListener();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, cardData, nfcHealthStatus, isBluetoothConnected]);

  /**
   * Check NFC health
   */
  const checkNFCHealth = async () => {
    try {
      setNfcHealthStatus('checking');
      setShowBluetoothOption(false);
      
      const health = await nfcBluetoothService.checkNFCHealth();
      setNfcHealthStatus(health);
      
      // Show Bluetooth option if NFC is unavailable or broken
      if (health === 'unavailable' || health === 'broken') {
        setShowBluetoothOption(true);
      }
    } catch (error: any) {
      console.error('Error checking NFC health:', error);
      setNfcHealthStatus('unavailable');
      setShowBluetoothOption(true);
    }
  };

  /**
   * Start NFC listener
   */
  const startNFCListener = async () => {
    try {
      setIsNFCListening(true);
      setNfcError(null);

      await nfcBluetoothService.startNFCListener(
        (cardData: NFCCardData) => {
          // Card detected successfully
          setCardData(cardData);
          setIsNFCListening(false);
          setNfcError(null);
        },
        (error: Error) => {
          // Error occurred
          setNfcError(error.message);
          setIsNFCListening(false);
        }
      );
    } catch (error: any) {
      setNfcError(error.message || 'Failed to start NFC listener');
      setIsNFCListening(false);
    }
  };

  /**
   * Stop NFC listener
   */
  const stopNFCListener = async () => {
    try {
      await nfcBluetoothService.stopNFCListener();
      setIsNFCListening(false);
    } catch (error) {
      console.error('Error stopping NFC listener:', error);
    }
  };

  /**
   * Manual NFC read (fallback)
   */
  const handleTapKartu = async () => {
    try {
      setIsNFCListening(true);
      setNfcError(null);

      const cardData = await nfcBluetoothService.readNFCCard();
      if (cardData) {
        setCardData(cardData);
      }
    } catch (error: any) {
      setNfcError(error.message || 'Failed to read NFC card');
    } finally {
      setIsNFCListening(false);
    }
  };

  /**
   * Start Bluetooth scan (optional, for external devices)
   */
  const startBluetoothScan = async () => {
    try {
      setIsBluetoothScanning(true);
      await nfcBluetoothService.scanBluetoothDevices((device) => {
        console.log('Bluetooth device found:', device);
        // Handle device found
      }, 10000);
    } catch (error: any) {
      console.error('Error scanning Bluetooth:', error);
      setIsBluetoothScanning(false);
    }
  };

  /**
   * Stop Bluetooth scan
   */
  const stopBluetoothScan = () => {
    nfcBluetoothService.stopBluetoothScan();
    setIsBluetoothScanning(false);
  };

  /**
   * Handle Bluetooth device selection
   */
  const handleBluetoothDeviceSelected = async (device: BluetoothDevice) => {
    setSelectedBluetoothDevice(device);
    setIsConnectingBluetooth(true);
    setNfcError(null);

    try {
      // Device is already connected in BluetoothDeviceSelector
      setIsBluetoothConnected(true);
      setIsConnectingBluetooth(false);
      
      // Start listening for card via Bluetooth
      startBluetoothCardListener();
    } catch (error: any) {
      console.error('Error handling Bluetooth device:', error);
      setNfcError(error.message || t('topUp.failedToUseBluetooth'));
      setIsConnectingBluetooth(false);
      setIsBluetoothConnected(false);
    }
  };

  /**
   * Handle Bluetooth device connected
   */
  const handleBluetoothDeviceConnected = (device: BluetoothDevice) => {
    setSelectedBluetoothDevice(device);
    setIsBluetoothConnected(true);
  };

  /**
   * Start listening for card via Bluetooth
   */
  const startBluetoothCardListener = async () => {
    // Polling mechanism to read card via Bluetooth
    let isPolling = true;
    
    const pollForCard = async () => {
      while (isPolling && !cardData) {
        try {
          // Check if still connected
          const connected = await nfcBluetoothService.isBluetoothDeviceConnected();
          if (!connected) {
            setNfcError('Perangkat Bluetooth terputus');
            setIsReadingViaBluetooth(false);
            setIsBluetoothConnected(false);
            return;
          }

          setIsReadingViaBluetooth(true);
          const readCardData = await nfcBluetoothService.readNFCCardViaBluetooth();
          
          if (readCardData) {
            setCardData(readCardData);
            setIsReadingViaBluetooth(false);
            isPolling = false;
            return;
          }
        } catch (error: any) {
          // If it's a timeout or no card, continue polling
          if (
            error?.message?.includes('timeout') ||
            error?.message?.includes('tidak ada data') ||
            error?.message?.includes('Waktu membaca kartu habis')
          ) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
          
          // For connection errors, stop polling
          if (
            error?.message?.includes('tidak terhubung') ||
            error?.message?.includes('terputus') ||
            error?.message?.includes('Connection timeout')
          ) {
            setNfcError(error.message || 'Perangkat Bluetooth terputus');
            setIsReadingViaBluetooth(false);
            setIsBluetoothConnected(false);
            isPolling = false;
            return;
          }
          
          // For other errors, show error but continue polling (might be temporary)
          setNfcError(error.message || t('topUp.failedToReadCardViaBluetooth'));
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    };

    pollForCard();
  };

  /**
   * Disconnect Bluetooth device
   */
  const handleDisconnectBluetooth = async () => {
    try {
      await nfcBluetoothService.disconnectCurrentBluetoothDevice();
      setSelectedBluetoothDevice(null);
      setIsBluetoothConnected(false);
      setIsReadingViaBluetooth(false);
      setCardData(null);
    } catch (error) {
      console.error('Error disconnecting Bluetooth:', error);
    }
  };

  const handleNext = () => {
    const numericAmount = parseInt(amount.replace(/\D/g, ''), 10) || 0;
    if (numericAmount <= 0) return;
    if (activeTab === 'id-member' && !memberId.trim()) return;
    if (activeTab === 'excel' && !excelFile) return;
    if (activeTab === 'top-kartu' && !cardData) return;

    const selectedBalance = BALANCE_TARGETS.find((b) => b.id === balanceTarget);

    // For Excel tab, skip summary and go directly to PIN bottom sheet
    if (activeTab === 'excel') {
      const pinData: TopUpMemberPinData = {
        tabType: activeTab,
        balanceTarget: balanceTarget,
        balanceTargetName: selectedBalance?.name || '',
        amount: numericAmount,
        memberId: '',
        memberName: '', // Will be from Excel file
        adminFee: Math.round(numericAmount * 0.1),
        totalAmount: numericAmount - Math.round(numericAmount * 0.1),
      };
      setPinData(pinData);
      setShowPinBottomSheet(true);
      return;
    }

    // Show summary in bottom sheet
    const summary: TopUpMemberSummaryData = {
      tabType: activeTab,
      balanceTarget: balanceTarget,
      balanceTargetName: selectedBalance?.name || '',
      amount: numericAmount,
      memberId: activeTab === 'id-member' ? memberId : cardData?.memberId || '',
      memberName: activeTab === 'top-kartu' ? cardData?.memberName : undefined,
    };

    console.log('Opening summary bottom sheet with data:', summary);
    setSummaryData(summary);
    setShowSummaryBottomSheet(true);
    console.log('State updated - showSummaryBottomSheet:', true, 'summaryData:', summary);
  };

  const handleSummaryConfirm = (
    data: TopUpMemberSummaryData & { adminFee: number; totalAmount: number }
  ) => {
    setShowSummaryBottomSheet(false);
    // Show PIN bottom sheet
    const pinData: TopUpMemberPinData = {
      tabType: data.tabType,
      balanceTarget: data.balanceTarget,
      balanceTargetName: data.balanceTargetName,
      amount: data.amount,
      memberId: data.memberId,
      memberName: data.memberName,
      adminFee: data.adminFee,
      totalAmount: data.totalAmount,
    };
    setPinData(pinData);
    setShowPinBottomSheet(true);
  };

  const handlePinComplete = (pin: string) => {
    setShowPinBottomSheet(false);
    // Navigate to success screen
    // @ts-ignore - navigation type akan di-setup nanti
    navigation.navigate('TopUpMemberSuccess', {
      ...pinData,
      pin: pin,
    });
  };

  const numericAmount = parseInt(amount.replace(/\D/g, ''), 10) || 0;
  const displayAmount = numericAmount > 0 ? formatCurrency(amount) : '';
  const selectedBalance = BALANCE_TARGETS.find((b) => b.id === balanceTarget);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft2 size={getIconSize('medium')} color={colors.text} variant="Outline" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('home.topUpMember')}
        </Text>
      </View>

      {/* Tab Switcher - Same as HomeScreen */}
      <View style={[styles.tabsContainer, { paddingHorizontal: getHorizontalPadding() }]}>
        <TabSwitcher
          variant="segmented"
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          scrollX={scrollX}
          pagerWidth={screenWidth}
        />
      </View>

      {/* Horizontal Pager - Swipeable Content */}
      <KeyboardAvoidingView
        style={styles.contentWrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
      >
        <Animated.ScrollView
          ref={pagerRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true },
          )}
          onMomentumScrollEnd={handlePagerMomentumEnd}
          style={styles.pagerContainer}
        >
          {/* ID Member Page */}
          <View style={[styles.pagerPage, { width: screenWidth }]}>
            <ScrollView
              ref={idMemberScrollRef}
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              bounces={false}
            >
            <View style={styles.section}>
            {/* Saldo Tujuan */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>{t('topUp.balanceTarget')}</Text>
            <TouchableOpacity
              style={[
                styles.dropdown,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setShowBalanceDropdown(!showBalanceDropdown)}
              activeOpacity={0.8}
            >
              <Text style={[styles.dropdownText, { color: colors.text }]}>
                {selectedBalance?.name || t('topUp.selectBalanceTarget')}
              </Text>
              <Animated.View
                style={{
                  transform: [
                    {
                      rotate: dropdownAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '180deg'],
                      }),
                    },
                  ],
                }}
              >
                <ArrowDown2
                  size={getIconSize('small')}
                  color={colors.textSecondary}
                  variant="Outline"
                />
              </Animated.View>
            </TouchableOpacity>

            {isDropdownVisible && (
              <Animated.View
                style={[
                  styles.dropdownMenu,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    opacity: dropdownOpacity,
                    transform: [
                      {
                        translateY: dropdownAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-10, 0],
                        }),
                      },
                      {
                        scale: dropdownAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.95, 1],
                        }),
                      },
                    ],
                  },
                ]}
              >
                {BALANCE_TARGETS.map((target) => (
                  <TouchableOpacity
                    key={target.id}
                    style={[
                      styles.dropdownItem,
                      balanceTarget === target.id && {
                        backgroundColor: colors.primary + '20',
                      },
                    ]}
                    onPress={() => {
                      setBalanceTarget(target.id);
                      setShowBalanceDropdown(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        {
                          color: balanceTarget === target.id ? colors.primary : colors.text,
                          fontFamily:
                            balanceTarget === target.id
                              ? FontFamily.monasans.semiBold
                              : FontFamily.monasans.regular,
                        },
                      ]}
                    >
                      {target.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </Animated.View>
            )}
          </View>

          {/* Nominal */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>{t('topUp.amount')}</Text>
            <View
              style={[
                styles.amountContainer,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.currencyPrefix, { color: colors.text }]}>Rp</Text>
              <TextInput
                style={[styles.amountInput, { color: colors.text }]}
                value={displayAmount}
                onChangeText={handleAmountChange}
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                selectTextOnFocus
                onFocus={() => {
                  setTimeout(() => {
                    if (activeTab === 'id-member' && idMemberScrollRef.current) {
                      idMemberScrollRef.current.scrollTo({ y: moderateVerticalScale(100), animated: true });
                    }
                  }, 100);
                }}
              />
            </View>
          </View>

              {/* ID Member Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>{t('topUp.memberId')}</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  value={memberId}
                  onChangeText={setMemberId}
                  placeholder={t('topUp.enterMemberId')}
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="characters"
                />
              </View>
            </View>
            </ScrollView>
          </View>

        {/* Excel Page */}
        <View style={[styles.pagerPage, { width: screenWidth }]}>
          <ScrollView
            ref={excelScrollRef}
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            bounces={false}
          >
            <View style={styles.section}>
              {/* Saldo Tujuan */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>{t('topUp.balanceTarget')}</Text>
                <TouchableOpacity
                  style={[
                    styles.dropdown,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => setShowBalanceDropdown(!showBalanceDropdown)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.dropdownText, { color: colors.text }]}>
                    {selectedBalance?.name || t('topUp.selectBalanceTarget')}
                  </Text>
                  <Animated.View
                    style={{
                      transform: [
                        {
                          rotate: dropdownAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '180deg'],
                          }),
                        },
                      ],
                    }}
                  >
                    <ArrowDown2
                      size={getIconSize('small')}
                      color={colors.textSecondary}
                      variant="Outline"
                    />
                  </Animated.View>
                </TouchableOpacity>

                {isDropdownVisible && (
                  <Animated.View
                    style={[
                      styles.dropdownMenu,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        opacity: dropdownOpacity,
                        transform: [
                          {
                            translateY: dropdownAnimation.interpolate({
                              inputRange: [0, 1],
                              outputRange: [-10, 0],
                            }),
                          },
                          {
                            scale: dropdownAnimation.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.95, 1],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    {BALANCE_TARGETS.map((target) => (
                      <TouchableOpacity
                        key={target.id}
                        style={[
                          styles.dropdownItem,
                          balanceTarget === target.id && {
                            backgroundColor: colors.primary + '20',
                          },
                        ]}
                        onPress={() => {
                          setBalanceTarget(target.id);
                          setShowBalanceDropdown(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.dropdownItemText,
                            {
                              color: balanceTarget === target.id ? colors.primary : colors.text,
                              fontFamily:
                                balanceTarget === target.id
                                  ? FontFamily.monasans.semiBold
                                  : FontFamily.monasans.regular,
                            },
                          ]}
                        >
                          {target.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </Animated.View>
                )}
              </View>

              {/* Nominal */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>{t('topUp.amount')}</Text>
                <View
                  style={[
                    styles.amountContainer,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.currencyPrefix, { color: colors.text }]}>Rp</Text>
                  <TextInput
                    style={[styles.amountInput, { color: colors.text }]}
                    value={displayAmount}
                    onChangeText={handleAmountChange}
                    placeholder="0"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    selectTextOnFocus
                  />
                </View>
              </View>

              {/* Excel Upload */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Upload File</Text>
                {excelFile ? (
                  <View
                    style={[
                      styles.filePreview,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.fileName, { color: colors.text }]}>{excelFile}</Text>
                    <TouchableOpacity
                      style={[
                        styles.uploadActionButton,
                        { backgroundColor: colors.primary },
                      ]}
                      onPress={handleExcelUpload}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.uploadActionButtonText}>{t('topUp.upload')}</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.uploadButton,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={handleExcelUpload}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.uploadButtonText, { color: colors.textSecondary }]}>
                      {t('topUp.selectExcelFile')}
                    </Text>
                  </TouchableOpacity>
                )}
                <View style={styles.templateLinkContainer}>
                  <Text style={[styles.templateLinkText, { color: colors.textSecondary }]}>
                    Seluruh punya template?{' '}
                  </Text>
                  <TouchableOpacity onPress={handleDownloadTemplate} activeOpacity={0.7}>
                    <Text style={[styles.templateLink, { color: colors.primary }]}>
                      Unduh Template
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Tap Kartu Page */}
        <View style={[styles.pagerPage, { width: screenWidth }]}>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.section}>
              <View style={styles.tapKartuContainer}>
              {/* NFC Tap Icon */}
              <View style={styles.nfcIconContainer}>
                <View
                  style={[
                    styles.phoneIcon,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.cardIcon,
                      {
                        backgroundColor: colors.primary,
                      },
                    ]}
                  />
                </View>
              </View>

              {/* NFC Health Status */}
              {nfcHealthStatus === 'checking' && (
                <View style={styles.statusContainer}>
                  <Text style={[styles.statusText, { color: colors.textSecondary }]}>
                    Memeriksa NFC...
                  </Text>
                </View>
              )}

              {/* NFC Unavailable/Broken - Show Bluetooth Option */}
              {showBluetoothOption && nfcHealthStatus !== 'checking' && (
                <View style={[styles.bluetoothOptionContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.bluetoothOptionTitle, { color: colors.text }]}>
                    {nfcHealthStatus === 'unavailable' 
                      ? t('topUp.nfcNotAvailable')
                      : t('topUp.nfcNotWorking')}
                  </Text>
                  <Text style={[styles.bluetoothOptionText, { color: colors.textSecondary }]}>
                    {t('topUp.useBluetoothAlternative')}
                  </Text>
                  <TouchableOpacity
                    style={[styles.bluetoothOptionButton, { backgroundColor: colors.primary }]}
                    onPress={() => setShowBluetoothSelector(true)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.bluetoothOptionButtonText}>
                      {t('topUp.useNFCBluetooth')}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Bluetooth Connected Status */}
              {isBluetoothConnected && selectedBluetoothDevice && (
                <View style={[styles.bluetoothConnectedContainer, { backgroundColor: '#10B981', borderColor: colors.border }]}>
                  <Text style={styles.bluetoothConnectedText}>
                    {t('topUp.connected')}: {selectedBluetoothDevice.name || t('topUp.bluetoothDevice')}
                  </Text>
                  <TouchableOpacity
                    style={styles.bluetoothDisconnectButton}
                    onPress={handleDisconnectBluetooth}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.bluetoothDisconnectButtonText}>
                      {t('topUp.disconnect')}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* NFC Listening Status */}
              {!showBluetoothOption && !isBluetoothConnected && (
                <Text style={[styles.tapKartuInstruction, { color: colors.text }]}>
                  {isNFCListening
                    ? t('topUp.tapCardOnPhone')
                    : isReadingViaBluetooth
                    ? t('topUp.tapCardOnBluetooth')
                    : t('topUp.tapCardHere')}
                </Text>
              )}

              {/* Bluetooth Reading Status */}
              {isReadingViaBluetooth && (
                <View style={styles.loadingContainer}>
                  <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                    {t('topUp.readingCardViaBluetooth')}
                  </Text>
                </View>
              )}

              {nfcError && (
                <View style={styles.errorContainer}>
                  <Text style={[styles.errorText, { color: '#FF3B30' }]}>
                    {nfcError}
                  </Text>
                  {nfcError.includes('tidak aktif') && (
                    <TouchableOpacity
                      style={[styles.settingsButton, { backgroundColor: colors.primary }]}
                      onPress={async () => {
                        try {
                          await nfcBluetoothService.openNFCSettings();
                        } catch (error) {
                          console.error('Error opening NFC settings:', error);
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.settingsButtonText}>{t('topUp.openNFCSettings')}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
              {isNFCListening && !isReadingViaBluetooth && (
                <View style={styles.loadingContainer}>
                  <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                    {t('topUp.readingCard')}
                  </Text>
                </View>
              )}

              {/* Card Data Display */}
              {cardData && (
                <View
                  style={[
                    styles.cardInfoContainer,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.cardInfoTitle, { color: colors.text }]}>
                    {t('topUp.cardDetected')}
                  </Text>
                  <Text style={[styles.cardInfoName, { color: colors.text }]}>
                    {cardData.memberName}
                  </Text>
                  <Text style={[styles.cardInfoId, { color: colors.textSecondary }]}>
                    ID: {cardData.memberId}
                  </Text>
                  <TouchableOpacity
                    style={[styles.resetButton, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      setCardData(null);
                      setNfcError(null);
                      startNFCListener();
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.resetButtonText}>{t('topUp.readCardAgain')}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Steps */}
                  <View style={styles.stepsContainer}>
                    <Text style={[styles.stepsTitle, { color: colors.text }]}>
                      {t('topUp.steps')}
                    </Text>
                    <View style={styles.stepItem}>
                      <Text style={[styles.stepNumber, { color: colors.primary }]}>1.</Text>
                      <Text style={[styles.stepText, { color: colors.text }]}>
                        {t('topUp.step1')}
                      </Text>
                    </View>
                    <View style={styles.stepItem}>
                      <Text style={[styles.stepNumber, { color: colors.primary }]}>2.</Text>
                      <Text style={[styles.stepText, { color: colors.text }]}>
                        {t('topUp.step2')}
                      </Text>
                    </View>
                    <View style={styles.stepItem}>
                      <Text style={[styles.stepNumber, { color: colors.primary }]}>3.</Text>
                      <Text style={[styles.stepText, { color: colors.text }]}>
                        {t('topUp.step3')}
                      </Text>
                    </View>
                  </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </Animated.ScrollView>
      </KeyboardAvoidingView>

      {/* Footer - Show for ID Member, Excel, and Tap Kartu (after card data loaded) */}
      {/* Footer berada di luar KeyboardAvoidingView agar tidak ikut naik saat keyboard muncul */}
      {(activeTab !== 'top-kartu' || cardData) && (
        <View
          style={[
            styles.footer,
            {
              backgroundColor: colors.background,
              borderTopColor: colors.border,
              paddingBottom: insets.bottom + moderateVerticalScale(16),
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.nextButton,
              {
                backgroundColor:
                  numericAmount > 0 &&
                  (activeTab !== 'id-member' || memberId.trim()) &&
                  (activeTab !== 'excel' || excelFile) &&
                  (activeTab !== 'top-kartu' || cardData)
                    ? colors.primary
                    : colors.border,
                opacity:
                  numericAmount > 0 &&
                  (activeTab !== 'id-member' || memberId.trim()) &&
                  (activeTab !== 'excel' || excelFile) &&
                  (activeTab !== 'top-kartu' || cardData)
                    ? 1
                    : 0.5,
              },
            ]}
            onPress={handleNext}
            disabled={
              numericAmount <= 0 ||
              (activeTab === 'id-member' && !memberId.trim()) ||
              (activeTab === 'excel' && !excelFile) ||
              (activeTab === 'top-kartu' && !cardData)
            }
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>{t('common.next')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* NFC Loading Modal - Full Screen */}
      <NFCLoadingModal
        visible={isNFCListening || isReadingViaBluetooth}
        message={
          isReadingViaBluetooth
            ? t('topUp.readingCardViaBluetooth')
            : t('topUp.detectingNFCCard')
        }
      />

      {/* Bluetooth Device Selector Modal */}
      {showBluetoothSelector && (
        <BluetoothDeviceSelector
          visible={showBluetoothSelector}
          onClose={() => setShowBluetoothSelector(false)}
          onDeviceSelected={handleBluetoothDeviceSelected}
          onDeviceConnected={handleBluetoothDeviceConnected}
        />
      )}

      {/* Summary Bottom Sheet */}
      <TopUpMemberSummaryBottomSheet
        visible={showSummaryBottomSheet}
        onClose={() => {
          console.log('Closing bottom sheet');
          setShowSummaryBottomSheet(false);
        }}
        data={summaryData}
        onConfirm={handleSummaryConfirm}
      />

      {/* PIN Bottom Sheet */}
      <TopUpMemberPinBottomSheet
        visible={showPinBottomSheet}
        onClose={() => {
          setShowPinBottomSheet(false);
        }}
        data={pinData}
        onComplete={handlePinComplete}
      />
    </SafeAreaView>
  );
};

const minTouchTarget = getMinTouchTarget();
const horizontalPadding = getHorizontalPadding();

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: horizontalPadding,
    paddingBottom: moderateVerticalScale(12),
  },
  backButton: {
    padding: moderateVerticalScale(8),
    minWidth: minTouchTarget,
    minHeight: minTouchTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.bold,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    minWidth: minTouchTarget,
    paddingHorizontal: scale(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRightText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  pagerContainer: {
    flex: 1,
  },
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: horizontalPadding,
    paddingTop: moderateVerticalScale(16),
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  pagerPage: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: moderateVerticalScale(100), // Extra padding untuk footer
  },
  tabsContainer: {
    paddingTop: moderateVerticalScale(16),
    paddingBottom: moderateVerticalScale(16),
  },
  section: {
    paddingHorizontal: horizontalPadding,
    marginTop: moderateVerticalScale(24),
  },
  inputGroup: {
    marginBottom: moderateVerticalScale(20),
  },
  label: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
    marginBottom: moderateVerticalScale(8),
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: moderateVerticalScale(16),
    borderRadius: scale(12),
    borderWidth: 1,
    minHeight: minTouchTarget,
  },
  dropdownText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
    flex: 1,
  },
  dropdownArrow: {
    fontSize: getResponsiveFontSize('small'),
    marginLeft: scale(8),
  },
  dropdownMenu: {
    marginTop: moderateVerticalScale(4),
    borderRadius: scale(12),
    borderWidth: 1,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: scale(16),
    paddingVertical: moderateVerticalScale(14),
    minHeight: minTouchTarget,
    justifyContent: 'center',
  },
  dropdownItemText: {
    fontSize: getResponsiveFontSize('medium'),
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: moderateVerticalScale(16),
    borderRadius: scale(12),
    borderWidth: 1,
  },
  currencyPrefix: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.bold,
    marginRight: scale(8),
  },
  amountInput: {
    flex: 1,
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.bold,
    padding: 0,
  },
  textInput: {
    paddingHorizontal: scale(16),
    paddingVertical: moderateVerticalScale(16),
    borderRadius: scale(12),
    borderWidth: 1,
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
    minHeight: minTouchTarget,
  },
  uploadButton: {
    paddingHorizontal: scale(16),
    paddingVertical: moderateVerticalScale(16),
    borderRadius: scale(12),
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: minTouchTarget,
  },
  uploadButtonText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
  },
  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: moderateVerticalScale(16),
    borderRadius: scale(12),
    borderWidth: 1,
    minHeight: minTouchTarget,
  },
  fileName: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
    flex: 1,
  },
  uploadActionButton: {
    paddingHorizontal: scale(16),
    paddingVertical: moderateVerticalScale(8),
    borderRadius: scale(8),
    minHeight: scale(36),
    justifyContent: 'center',
  },
  uploadActionButtonText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.semiBold,
    color: '#FFFFFF',
  },
  templateLinkContainer: {
    flexDirection: 'row',
    marginTop: moderateVerticalScale(12),
    alignItems: 'center',
  },
  templateLinkText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
  },
  templateLink: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.semiBold,
    textDecorationLine: 'underline',
  },
  tapKartuContainer: {
    alignItems: 'center',
  },
  nfcIconContainer: {
    marginBottom: moderateVerticalScale(24),
  },
  phoneIcon: {
    width: scale(120),
    height: scale(180),
    borderRadius: scale(20),
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cardIcon: {
    width: scale(80),
    height: scale(50),
    borderRadius: scale(8),
    position: 'absolute',
    top: scale(20),
  },
  tapKartuInstruction: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.semiBold,
    textAlign: 'center',
    marginBottom: moderateVerticalScale(24),
  },
  stepsContainer: {
    width: '100%',
    marginBottom: moderateVerticalScale(24),
  },
  stepsTitle: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: moderateVerticalScale(12),
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: moderateVerticalScale(8),
    alignItems: 'flex-start',
  },
  stepNumber: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.bold,
    marginRight: scale(8),
  },
  stepText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
    flex: 1,
  },
  tapButton: {
    width: '100%',
    paddingVertical: moderateVerticalScale(16),
    borderRadius: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: minTouchTarget,
  },
  tapButtonText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    color: '#FFFFFF',
  },
  cardInfoContainer: {
    padding: scale(16),
    borderRadius: scale(12),
    borderWidth: 1,
    marginBottom: moderateVerticalScale(24),
  },
  cardInfoTitle: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: moderateVerticalScale(8),
  },
  cardInfoName: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: moderateVerticalScale(4),
  },
  cardInfoId: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    marginBottom: moderateVerticalScale(4),
  },
  cardInfoBalance: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    marginTop: moderateVerticalScale(8),
  },
  errorContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: moderateVerticalScale(8),
  },
  errorText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    textAlign: 'center',
    marginBottom: moderateVerticalScale(12),
  },
  settingsButton: {
    paddingHorizontal: scale(24),
    paddingVertical: moderateVerticalScale(12),
    borderRadius: scale(8),
    minHeight: minTouchTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsButtonText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.semiBold,
    color: '#FFFFFF',
  },
  loadingContainer: {
    marginTop: moderateVerticalScale(16),
    alignItems: 'center',
  },
  loadingText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
  },
  resetButton: {
    marginTop: moderateVerticalScale(12),
    paddingHorizontal: scale(16),
    paddingVertical: moderateVerticalScale(12),
    borderRadius: scale(8),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: minTouchTarget,
  },
  resetButtonText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.semiBold,
    color: '#FFFFFF',
  },
  nextButton: {
    width: '100%',
    paddingVertical: moderateVerticalScale(16),
    borderRadius: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: minTouchTarget,
  },
  nextButtonText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    color: '#FFFFFF',
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: moderateVerticalScale(16),
  },
  statusText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
  },
  bluetoothOptionContainer: {
    padding: moderateScale(16),
    borderRadius: scale(12),
    borderWidth: 1,
    marginBottom: moderateVerticalScale(16),
    alignItems: 'center',
  },
  bluetoothOptionTitle: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: moderateVerticalScale(8),
    textAlign: 'center',
  },
  bluetoothOptionText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    marginBottom: moderateVerticalScale(16),
    textAlign: 'center',
  },
  bluetoothOptionButton: {
    paddingHorizontal: scale(24),
    paddingVertical: moderateVerticalScale(12),
    borderRadius: scale(8),
    minHeight: minTouchTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bluetoothOptionButtonText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.semiBold,
    color: '#FFFFFF',
  },
  bluetoothConnectedContainer: {
    padding: moderateScale(16),
    borderRadius: scale(12),
    borderWidth: 1,
    marginBottom: moderateVerticalScale(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bluetoothConnectedText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.semiBold,
    color: '#FFFFFF',
    flex: 1,
  },
  bluetoothDisconnectButton: {
    paddingHorizontal: scale(16),
    paddingVertical: moderateVerticalScale(8),
    borderRadius: scale(6),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    minHeight: scale(32),
    justifyContent: 'center',
    alignItems: 'center',
  },
  bluetoothDisconnectButtonText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.semiBold,
    color: '#FFFFFF',
  },
});

