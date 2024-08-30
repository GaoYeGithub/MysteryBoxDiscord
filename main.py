import discord
from discord import app_commands
import asyncio
import aiohttp
import random
from dotenv import load_dotenv
load_dotenv()
import os

class MysteryBoxClient(discord.Client):
    def __init__(self):
        intents = discord.Intents.default()
        intents.message_content = True
        super().__init__(intents=intents)
        self.tree = app_commands.CommandTree(self)

    async def setup_hook(self):
        await self.tree.sync()

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
        
        print(f"User answer: '{user_answer}'")
        print(f"Correct answer: '{correct_answer}'")
        
        if user_answer == correct_answer:
            box_embed = discord.Embed(title=f"Mystery Box: {box['title']}", description=box['description'], color=0x00ff00)
            box_embed.set_image(url=box['image'])
            box_embed.add_field(name="Rarity", value=box['rarity'], inline=True)
            box_embed.add_field(name="Created", value=box['created'], inline=True)

            await interaction.followup.send('Correct! You unlocked the mystery box!', embed=box_embed)
        else:
            await interaction.followup.send(f'Sorry, that\'s incorrect. The correct answer was: {box["answer"]}')

@client.event
async def on_ready():
    print(f'Logged in as {client.user} (ID: {client.user.id})')

client.run(os.getenv('BOT_TOKEN'))