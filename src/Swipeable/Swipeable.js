import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  ScrollView,
  Dimensions,
  Text,
} from 'react-native';
import moment from 'moment';
import WeekView from '../WeekView/WeekView';
import Header from '../Header/Header';
import styles from './Swipeable.styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TIME_LABELS_COUNT = 48;

const TimeLabel = ({ time }) => {
  return (
    <View style={styles.timeLabel}>
      <Text style={styles.timeText}>{time}</Text>
    </View>
  );
};
export default class Swipeable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentMoment: props.selectedDate,
    };
    this.calendar = null;
    this.times = this.generateTimes();
  }

  componentDidMount() {
    requestAnimationFrame(() => {
      this.calendar.scrollTo({ y: 0, x: 2 * (SCREEN_WIDTH - 40), animated: false });
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedDate) {
      this.setState({ currentMoment: nextProps.selectedDate });
    }
  }

  componentDidUpdate() {
    this.calendar.scrollTo({ y: 0, x: 2 * (SCREEN_WIDTH - 40), animated: false });
  }

  generateTimes = () => {
    const times = [];
    for (let i = 0; i < TIME_LABELS_COUNT; i += 1) {
      const minutes = i % 2 === 0 ? '00' : '30';
      const hour = Math.floor(i / 2);
      const time = `${hour}:${minutes}`;
      times.push(time);
    }
    return times;
  };

  scrollEnded = (event) => {
    const { nativeEvent: { contentOffset, contentSize } } = event;
    const { x: position } = contentOffset;
    const { width: innerWidth } = contentSize;
    const newPage = (position / innerWidth) * 5;
    const { onSwipePrev, onSwipeNext, numberOfDays } = this.props;
    const { currentMoment } = this.state;
    requestAnimationFrame(() => {
      const newMoment = moment(currentMoment)
        .add((newPage - 2) * numberOfDays, 'd')
        .toDate();

      this.setState({ currentMoment: newMoment });

      if (newPage < 2) {
        onSwipePrev && onSwipePrev(newMoment);
      } else if (newPage > 2) {
        onSwipeNext && onSwipeNext(newMoment);
      }
    });
  };

  scrollViewRef = (ref) => {
    this.calendar = ref;
  }

  prepareDates = (currentMoment, numberOfDays) => {
    const dates = [];
    for (let i = -2; i < 3; i += 1) {
      const date = moment(currentMoment).add(numberOfDays * i, 'd');
      dates.push(date);
    }
    return dates;
  };

  render() {
    const {
      numberOfDays,
      headerStyle,
      formatDateHeader,
      onEventPress,
      events,
    } = this.props;
    const { currentMoment } = this.state;
    const dates = this.prepareDates(currentMoment, numberOfDays);
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Header
            style={headerStyle}
            formatDate={formatDateHeader}
            selectedDate={currentMoment}
            numberOfDays={numberOfDays}
          />
        </View>
        <ScrollView>
          <View style={styles.scrollViewContent}>
            <View style={styles.timeColumn}>
              {this.times.map((time) => {
                return (<TimeLabel key={time} time={time} />);
              })}
            </View>
            <View style={styles.eventsColumn}>
              <ScrollView
                horizontal
                pagingEnabled
                automaticallyAdjustContentInsets={false}
                onMomentumScrollEnd={this.scrollEnded}
                ref={this.scrollViewRef}
              >
                {dates.map((date) => {
                  return (
                    <View
                      key={date}
                      style={{ flex: 1, width: SCREEN_WIDTH - 40 }}
                    >
                      <WeekView
                        key={dates}
                        times={this.times}
                        selectedDate={date.toDate()}
                        numberOfDays={numberOfDays}
                        onEventPress={onEventPress}
                        events={events}
                      />
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }
}

Swipeable.propTypes = {
  events: PropTypes.object,
  numberOfDays: PropTypes.oneOf([3, 5, 7]).isRequired,
  onSwipeNext: PropTypes.func,
  onSwipePrev: PropTypes.func,
  formatDateHeader: PropTypes.string,
  onEventPress: PropTypes.func,
  headerStyle: PropTypes.object,
};