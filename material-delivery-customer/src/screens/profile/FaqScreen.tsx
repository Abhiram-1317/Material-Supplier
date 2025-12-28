import React from 'react';
import {ScrollView, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Divider, List, Text, useTheme} from 'react-native-paper';

const FAQ_ITEMS = [
  {
    question: 'How do I return an order?',
    answer:
      'Open your Orders, choose the item, and select Return. We will guide you through pickup or drop-off as available in your area.',
  },
  {
    question: 'What payment methods are supported?',
    answer: 'You can pay using UPI, cards, net banking, or cash on delivery where available.',
  },
  {
    question: 'How long does delivery take?',
    answer: 'Most deliveries arrive in 2-5 business days depending on stock and your location.',
  },
  {
    question: 'Can I change my delivery address?',
    answer: 'Address changes are possible until dispatch. Chat with support and share your order ID.',
  },
];

export function FaqScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#F3F4F6'}}>
      <ScrollView contentContainerStyle={{padding: 24, paddingBottom: 32}}>
        <View style={{marginBottom: 12}}>
          <Text style={{fontSize: 24, fontWeight: '700', marginBottom: 6}}>FAQs</Text>
          <Text style={{color: '#4B5563'}}>Answers to common questions.</Text>
        </View>

        <View style={{backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB'}}>
          {FAQ_ITEMS.map((item, idx) => (
            <React.Fragment key={item.question}>
              <List.Accordion
                title={item.question}
                titleStyle={{fontWeight: '700'}}
                style={{backgroundColor: '#FFFFFF'}}
                theme={{colors: {primary: theme.colors.primary}}}>
                <List.Item
                  title={item.answer}
                  titleNumberOfLines={4}
                  description={undefined}
                  titleStyle={{color: '#4B5563'}}
                />
              </List.Accordion>
              {idx < FAQ_ITEMS.length - 1 ? <Divider /> : null}
            </React.Fragment>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
