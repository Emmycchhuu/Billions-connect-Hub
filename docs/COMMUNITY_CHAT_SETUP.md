# Community Chat Setup Guide

## Database Setup

1. Run the SQL scripts in this order:
   ```sql
   -- First, run the main community chat schema
   \i database/community_chat.sql
   
   -- Then run the referral system
   \i database/referral_system.sql
   
   -- Finally, run the user levels
   \i database/user_levels.sql
   ```

## Mod Bot Configuration

The mod bot will automatically ask Billions-related questions up to 7 times per 24 hours. Questions are stored in the `mod_bot_questions` table.

### Setting up Cron Job (Optional)

To automatically trigger questions every few hours, set up a cron job:

```bash
# Add this to your crontab (crontab -e)
# Ask questions every 3 hours (8 times per day max)
0 */3 * * * curl -X GET "https://your-domain.com/api/cron/mod-bot"
```

### Manual Question Trigger

You can also manually trigger questions by calling:
```bash
curl -X GET "https://your-domain.com/api/cron/mod-bot"
```

## Features

✅ **Real-time Chat**: Messages update instantly using Supabase real-time subscriptions
✅ **Profile Pictures**: User avatars display in chat messages
✅ **Online Count**: Shows approximate number of active users
✅ **Mod Bot Questions**: Billions trivia questions with point rewards
✅ **Bad Word Filter**: Automatic moderation of inappropriate content
✅ **Twitter Link Validation**: Only Twitter/X links are allowed
✅ **Point Rewards**: First correct answer wins points
✅ **Unlimited Spins**: Removed spin limits from Billions Spin game
✅ **Top 5 Leaderboard**: Dashboard shows top 5 players with profile pictures

## Community Guidelines

- Be respectful and kind to other players
- Only Twitter/X links are allowed
- No spam, harassment, or inappropriate content
- Keep discussions related to gaming and Billions Network
- Messages are moderated automatically

## Mod Bot Questions

The mod bot asks questions about the Billions TV show, including:
- Character names (Bobby Axelrod, Chuck Rhoades, etc.)
- Company names (Axe Capital, Taylor Mason Capital)
- Plot details and relationships
- Professional roles of characters

Each correct answer awards 50 points to the first responder.
