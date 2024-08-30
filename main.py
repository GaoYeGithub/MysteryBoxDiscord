import discord
from discord import app_commands
import asyncio
import aiohttp
import random
from dotenv import load_dotenv
import os
from datetime import datetime, timedelta

load_dotenv()

class MysteryBoxClient(discord.Client):
    def __init__(self):
        intents = discord.Intents.default()
        intents.message_content = True
        intents.guilds = True
        intents.members = True
        super().__init__(intents=intents)
        self.tree = app_commands.CommandTree(self)
        self.last_daily_claims = {}
        self.user_boxes = {}

    async def setup_hook(self):
        await self.tree.sync()

    async def send_notification(self, user_id: int, message: str):
        user = self.get_user(user_id)
        if user:
            await user.send(message)

client = MysteryBoxClient()

@client.tree.command()
async def open_mystery_box(interaction: discord.Interaction):
    """Answer a question to open a mystery box!"""
    async with aiohttp.ClientSession() as session:
        async with session.get('http://localhost:8090/api/collections/mystery_boxes/records') as response:
            boxes = await response.json()
            box = random.choice(boxes['items'])

    embed = discord.Embed(title="Mystery Question", description="Answer correctly to unlock the mystery box!", color=0x00ff00)
    embed.add_field(name="Question", value=box['question'], inline=False)

    await interaction.response.send_message(embed=embed)
    
    def check(m):
        return m.author == interaction.user and m.channel == interaction.channel

    try:
        msg = await client.wait_for('message', check=check, timeout=60.0)
    except asyncio.TimeoutError:
        await interaction.followup.send('Sorry, you took too long to answer!')
    else:
        user_answer = msg.content.strip().lower()
        correct_answer = box['answer'].strip().lower()
        
        if user_answer == correct_answer:
            box_embed = discord.Embed(title=f"Mystery Box: {box['title']}", description=box['description'], color=0x00ff00)
            box_embed.set_image(url=box['image'])
            box_embed.add_field(name="Rarity", value=box['rarity'], inline=True)
            box_embed.add_field(name="Created", value=box['created'], inline=True)

            if interaction.user.id not in client.user_boxes:
                client.user_boxes[interaction.user.id] = []
            client.user_boxes[interaction.user.id].append(box)

            await interaction.followup.send('Correct! You unlocked the mystery box!', embed=box_embed)
        else:
            await interaction.followup.send(f'Sorry, that\'s incorrect. The correct answer was: {box["answer"]}')

@client.tree.command()
async def trade_box(interaction: discord.Interaction, user: discord.User, box_title: str):
    """Trade a mystery box with another user"""
    if interaction.user.id not in client.user_boxes or box_title not in [box['title'] for box in client.user_boxes[interaction.user.id]]:
        await interaction.response.send_message("You don't have this box to trade.")
        return

    box_to_trade = next(box for box in client.user_boxes[interaction.user.id] if box['title'] == box_title)
    client.user_boxes[interaction.user.id].remove(box_to_trade)

    if user.id not in client.user_boxes:
        client.user_boxes[user.id] = []
    client.user_boxes[user.id].append(box_to_trade)

    await interaction.response.send_message(f"Successfully traded '{box_title}' with {user.name}!")

@client.tree.command()
async def daily_reward(interaction: discord.Interaction):
    """Claim your daily reward"""
    last_claim = client.last_daily_claims.get(interaction.user.id)
    if last_claim and datetime.now() < last_claim + timedelta(days=1):
        await interaction.response.send_message("You've already claimed your daily reward today. Come back tomorrow!")
        return

    async with aiohttp.ClientSession() as session:
        async with session.get('http://localhost:8090/api/collections/mystery_boxes/records') as response:
            boxes = await response.json()
            box = random.choice(boxes['items'])

    if interaction.user.id not in client.user_boxes:
        client.user_boxes[interaction.user.id] = []
    client.user_boxes[interaction.user.id].append(box)

    client.last_daily_claims[interaction.user.id] = datetime.now()
    await interaction.response.send_message(f"Daily reward claimed! You've received a new mystery box: {box['title']}")

@client.tree.command()
async def view_analytics(interaction: discord.Interaction):
    """View analytics data (Admin only)"""
    if not interaction.user.guild_permissions.administrator:
        await interaction.response.send_message("You don't have permission to use this command.")
        return

    total_boxes = sum(len(boxes) for boxes in client.user_boxes.values())
    total_users = len(client.user_boxes)
    total_trades = sum(len(boxes) for boxes in client.user_boxes.values() if len(boxes) > 1)

    embed = discord.Embed(title="Analytics Dashboard", color=0x00ff00)
    embed.add_field(name="Total Boxes", value=total_boxes, inline=True)
    embed.add_field(name="Total Users", value=total_users, inline=True)
    embed.add_field(name="Total Trades", value=total_trades, inline=True)

    await interaction.response.send_message(embed=embed)

@client.tree.command()
async def view_mystery_boxes(interaction: discord.Interaction):
    """View all mystery boxes"""
    async with aiohttp.ClientSession() as session:
        async with session.get('http://localhost:8090/api/collections/mystery_boxes/records') as response:
            data = await response.json()
            boxes = data['items']

    if not boxes:
        await interaction.response.send_message("No mystery boxes found.")
        return

    embeds = []
    for box in boxes:
        embed = discord.Embed(title=f"Mystery Box: {box['title']}", description=box['description'], color=0x00ff00)
        embed.add_field(name="Question", value=box['question'], inline=False)
        embed.add_field(name="Rarity", value=box['rarity'], inline=True)
        embed.add_field(name="Created", value=box['created'], inline=True)
        embed.set_image(url=box['image'])
        embeds.append(embed)

    await interaction.response.send_message(embeds=embeds)

@client.tree.command()
@app_commands.describe(
    title="Title of the mystery box",
    question="Question for the mystery box",
    answer="Answer to the question",
    description="Description of the mystery box",
    rarity="Rarity of the mystery box",
    image="URL of the image for the mystery box"
)
async def add_mystery_box(interaction: discord.Interaction, title: str, question: str, answer: str, description: str, rarity: str, image: str):
    """Add a new mystery box"""
    new_box = {
        "title": title,
        "question": question,
        "answer": answer,
        "description": description,
        "rarity": rarity,
        "image": image
    }

    async with aiohttp.ClientSession() as session:
        async with session.post('http://localhost:8090/api/collections/mystery_boxes/records', json=new_box) as response:
            if response.status == 200:
                await interaction.response.send_message(f"Mystery box '{title}' has been added successfully!")
            else:
                await interaction.response.send_message("Failed to add the mystery box. Please try again.")

@client.event
async def on_ready():
    print(f'Logged in as {client.user} (ID: {client.user.id})')

    async def background_notification_task():
        while True:
            for user_id in client.user_boxes.keys():
                await client.send_notification(user_id, "Don't forget to check out your mystery boxes!")
            await asyncio.sleep(3600)

    client.loop.create_task(background_notification_task())

client.run(os.getenv('BOT_TOKEN'))
