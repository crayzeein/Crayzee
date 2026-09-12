const Visit = require('../models/Visit');
const User = require('../models/User');

// @desc    Track a page visit
// @route   POST /api/analytics/visit
// @access  Public
exports.trackVisit = async (req, res) => {
  try {
    const { visitorId, path: pagePath, referrer, deviceType } = req.body;

    if (!visitorId) {
      return res.status(400).json({ message: 'visitorId is required' });
    }

    const vid = String(visitorId).trim();
    if (!/^v_[a-z0-9]{8,40}$/i.test(vid)) {
      return res.status(400).json({ message: 'Invalid visitorId' });
    }

    const cleanPath = pagePath ? String(pagePath).trim().slice(0, 200) : '/';

    // One row per visitor+path per 30 min, so a spammer cannot inflate the numbers
    const halfHourAgo = new Date(Date.now() - 30 * 60 * 1000);
    const recent = await Visit.exists({ visitorId: vid, path: cleanPath, createdAt: { $gte: halfHourAgo } });
    if (recent) return res.status(200).json({ success: true, deduped: true });

    const userId = req.user ? req.user._id : null;

    await Visit.create({
      visitorId: vid,
      user: userId,
      path: cleanPath,
      referrer: referrer ? String(referrer).trim().slice(0, 200) : 'Direct',
      deviceType: ['mobile', 'desktop', 'tablet'].includes(deviceType) ? deviceType : 'unknown'
    });

    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Track visit error:', error.message);
    res.status(500).json({ success: false });
  }
};

// @desc    Get Analytics & Retention Dashboard Data
// @route   GET /api/analytics/dashboard
// @access  Private / Admin
exports.getAnalyticsDashboard = async (req, res) => {
  try {
    const now = new Date();
    
    // Start of Today (00:00:00)
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    // 7 Days ago
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 30 Days ago
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 15 Minutes ago (Live active visitors)
    const fifteenMinsAgo = new Date(now.getTime() - 15 * 60 * 1000);

    // 1. Live Active Visitors (last 15m)
    const liveActiveVisitors = await Visit.distinct('visitorId', {
      createdAt: { $gte: fifteenMinsAgo }
    });

    // 2. Today's stats
    const todayPageviews = await Visit.countDocuments({ createdAt: { $gte: startOfToday } });
    const todayUniqueVisitors = (await Visit.distinct('visitorId', { createdAt: { $gte: startOfToday } })).length;

    // 3. Last 7 Days Total Stats
    const weekPageviews = await Visit.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const weekUniqueVisitors = (await Visit.distinct('visitorId', { createdAt: { $gte: sevenDaysAgo } })).length;

    // 4. Multiple Retention Analysis (Returning Visitors across the last 30 days)
    const retentionAggregation = await Visit.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: '$visitorId',
          totalVisits: { $sum: 1 },
          firstSeen: { $min: '$createdAt' },
          lastSeen: { $max: '$createdAt' }
        }
      }
    ]);

    const totalTrackedVisitors = retentionAggregation.length;
    let singleVisitVisitors = 0;
    let returningVisitors = 0; // Visited 2 or more times
    let highlyRetainedVisitors = 0; // Visited 4 or more times

    retentionAggregation.forEach(v => {
      if (v.totalVisits === 1) {
        singleVisitVisitors++;
      } else {
        returningVisitors++;
        if (v.totalVisits >= 4) {
          highlyRetainedVisitors++;
        }
      }
    });

    const retentionRate = totalTrackedVisitors > 0 
      ? Math.round((returningVisitors / totalTrackedVisitors) * 100) 
      : 0;

    // 5. Daily Breakdown for Chart (Last 7 Days)
    const dailyTrend = await Visit.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          pageviews: { $sum: 1 },
          visitors: { $addToSet: '$visitorId' }
        }
      },
      {
        $project: {
          date: '$_id',
          pageviews: 1,
          uniqueVisitors: { $size: '$visitors' }
        }
      },
      { $sort: { date: 1 } }
    ]);

    // 6. Top Visited Pages
    const topPages = await Visit.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: '$path', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]);

    // 7. Device Breakdown
    const deviceBreakdown = await Visit.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: '$deviceType', count: { $sum: 1 } } }
    ]);

    res.json({
      liveActiveNow: liveActiveVisitors.length,
      today: {
        pageviews: todayPageviews,
        uniqueVisitors: todayUniqueVisitors
      },
      week: {
        pageviews: weekPageviews,
        uniqueVisitors: weekUniqueVisitors
      },
      retention: {
        totalVisitors: totalTrackedVisitors,
        newVisitors: singleVisitVisitors,
        returningVisitors: returningVisitors,
        highlyRetainedVisitors: highlyRetainedVisitors,
        retentionRate: retentionRate
      },
      dailyTrend,
      topPages,
      deviceBreakdown
    });

  } catch (error) {
    console.error('Analytics dashboard error:', error.message);
    res.status(500).json({ message: error.message });
  }
};
